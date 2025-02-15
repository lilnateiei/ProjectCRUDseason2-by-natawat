const BASE_URL = "https://679ccfb987618946e6537ec9.mockapi.io/";

window.onload = async () => {
  await loadData();
};

const loadData = async (searchQuery = "") => {
  let courses = [];

  try {
    let response;
    if (searchQuery && !isNaN(searchQuery)) {
      response = await axios.get(`${BASE_URL}course/${searchQuery}`);
      courses = response.data ? [response.data] : [];
    } else {
      response = await axios.get(`${BASE_URL}course`);
      courses = response.data;
    }

    if (searchQuery && isNaN(searchQuery)) {
      courses = courses.filter(
        (course) =>
          String(course.langue).toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(course.des).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    let courseHTMLData = `
      <table class="table-auto border-2 border-gray-300 border-opacity-50 w-full mt-5 shadow-lg rounded-xl">
        <thead class="bg-blue-400">
          <tr>
            <th class="px-4 py-2 text-white">ภาษา</th>
            <th class="px-4 py-2 text-white">ชั่วโมง</th>
            <th class="px-4 py-2 text-white">คำอธิบาย</th>
            <th class="px-4 py-2 text-white">จัดการ</th>
          </tr>
        </thead>
        <tbody>`;

    courses.forEach((course) => {
      courseHTMLData += `
        <tr class="bg-blue-100">
          <td class="px-4 py-2 text-black text-center">${course.langue}</td>
          <td class="px-4 py-2 text-black text-center">${course.hour}</td>
          <td class="px-4 py-2 text-black text-center">${course.des}</td>
          <td class="px-4 py-2 text-black text-center">
            <button class="btn btn-outline btn-success text-center" onclick="editCourse('${course.id}')">
              Edit <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="btn btn-outline btn-error text-center delete" data-id="${course.id}">
              Delete <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>`;
    });

    courseHTMLData += `</tbody></table>`;
    document.getElementById("course").innerHTML = courseHTMLData;

    let deleteDOMs = document.querySelectorAll(".delete");
    deleteDOMs.forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        let id = event.currentTarget.dataset.id;
        if (!id) return;

        Swal.fire({
          title: "ยืนยันการลบ?",
          text: "คุณต้องการลบคอร์สนี้จริงหรือไม่?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "ใช่, ลบเลย!",
          cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await axios.delete(`${BASE_URL}course/${id}`);
              Swal.fire("ลบสำเร็จ!", "คอร์สถูกลบแล้ว", "success");
              loadData();
            } catch (error) {
              console.log("Delete Error:", error);
              Swal.fire("ผิดพลาด!", "ไม่สามารถลบข้อมูลได้", "error");
            }
          }
        });
      });
    });
  } catch (error) {
    console.error("Load Data Error:", error);
    Swal.fire({
      text: "ไม่พบการโหลดโปรดตรวจสอบ API หรือ Server",
      icon: "warning",
      confirmButtonText: "ตกลง",
    });
  }
};

const editCourse = (id) => {
  window.location.href = `add.html?id=${id}&edited=true`;
};

const searchCourse = async () => {
  const searchInput = document.getElementById("search").value;
  await loadData(searchInput);
};

const submitData = async () => {
  const langueDOM = document.getElementById("langue");
  const hourDOM = document.getElementById("hour");
  const desDOM = document.getElementById("des");

  if (!langueDOM || !hourDOM || !desDOM) {
    Swal.fire({
      text: "ไม่พบช่องกรอกข้อมูล",
      icon: "warning",
      confirmButtonText: "ตกลง",
    });
    return;
  }

  const courseData = {
    langue: langueDOM.value,
    hour: hourDOM.value,
    des: desDOM.value,
  };

  try {
    await axios.post(`${BASE_URL}course`, courseData);
    Swal.fire({
      text: "เพิ่มข้อมูลสำเร็จ!",
      icon: "success",
      confirmButtonText: "ตกลง",
    }).then(() => {
      window.location.href = "course.html";
    });
  } catch (error) {
    console.error("Submit Error:", error);
    Swal.fire({
      text: "เกิดข้อผิดพลาดในการอัพโหลดข้อมูล",
      icon: "error",
      confirmButtonText: "ตกลง",
    });
  }
};
