const BASE_URL = "https://67950ceeaad755a134eb14bf.mockapi.io";
const TOKEN_KEY = "token"; 
const SECRET_KEY = "mysecret";  

// ตรวจสอบว่า token ถูกต้องหรือไม่
const checkToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return false;
  }

  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) {
      return false;
    }

    const validSignature = btoa(`${header}.${body}.${SECRET_KEY}`);
    if (signature !== validSignature) {
      return false;
    }

    const payload = JSON.parse(atob(body));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp < currentTime) {
      Swal.fire({
        text: 'โทเค่นไม่ถูกต้องหรือหมดอายุ',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      localStorage.removeItem(TOKEN_KEY);
      return false;
    }

    return true;
  } catch (error) {
    console.error("ข้อผิดพลาดในการตรวจสอบ token:", error);
    return false;
  }
};

window.onload = async () => {
  if (!checkToken()) {
    Swal.fire({
      text: 'โทเค่นไม่ถูกต้องหรือหมดอายุ',
      icon: 'warning',
      confirmButtonText: 'ตกลง'
    }).then(() => {
      window.location.href = "./index.html";
    });
    return;
  }
  await loadData();
};

// ฟังก์ชันโหลดข้อมูล
const loadData = async (searchQuery = "") => {
  let exsercise = [];

  try {
    if (!isNaN(searchQuery) && searchQuery !== "") {
      // ค้นหาข้อมูลจาก ID
      const response = await axios.get(`${BASE_URL}/exsercise/${searchQuery}`);
      exsercise = response.data ? [response.data] : [];  
    } else {
      // ค้นหาทั้งหมด
      const response = await axios.get(`${BASE_URL}/exsercise`);
      exsercise = response.data;
    }

    if (searchQuery && isNaN(searchQuery)) {
      // ค้นหาข้อมูลจากชื่อกล้ามเนื้อหรือท่าออกกำลังกาย
      exsercise = exsercise.filter(
        (item) =>
          item.muscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.workout.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    let exserciseHTMLData = `
      <table class="table" border="1" cellspacing="1" cellpadding="5">
        <thead>
          <tr class="bg-blue-200 text-white text-center">
            <th>ส่วนกล้ามเนื้อ</th>
            <th>ท่าออกกำลังกาย</th>
            <th>เซ็ตที่ออกกำลังกาย</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>`;

    exsercise.forEach((item) => {
      exserciseHTMLData += `
        <tr>
          <td class="text-center">${item.muscle}</td>
          <td class="text-center">${item.workout}</td>
          <td class="text-center">${item.setup}</td>
          <td class="text-center">
            <button class="btn btn-outline btn-success text-white" onclick="editUser('${item.id}')">
              Edit <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="delete btn btn-outline btn-error text-center" data-id="${item.id}">
              Delete <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>`;
    });

    exserciseHTMLData += `</tbody></table>`;
    document.getElementById("exsercise").innerHTML = exserciseHTMLData;

    document.querySelectorAll(".delete").forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        const id = event.currentTarget.getAttribute("data-id");
        Swal.fire({
          title: 'ยืนยันการลบ?',
          text: "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ใช่, ลบเลย!',
          cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await axios.delete(`${BASE_URL}/exsercise/${id}`);
              await loadData();
              Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบแล้ว', 'success');
            } catch (error) {
              Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
            }
          }
        });
      });
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("edit")) {
      await loadData();
    }
  } catch (error) {
    Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
  }
};

const editUser = (id) => {
  window.location.href = `./create.html?id=${id}&edited=true`;
};

const SearchQuery = async () => {
  const searchInput = document.getElementById("search").value;
  await loadData(searchInput);
};

const submitData = async () => {
  const muscleDOM = document.getElementById("muscle-group");
  const workoutDOM = document.getElementById("exercise");
  const setupDOM = document.getElementById("sets");

  if (!muscleDOM || !workoutDOM || !setupDOM) {
    Swal.fire({
      text: 'ไม่พบ input field ที่ต้องการ กรุณาตรวจสอบ ID ของ input fields',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    });
    return;
  }

  const exserciseData = {
    muscle: muscleDOM.value.trim(),
    workout: workoutDOM.value.trim(),
    setup: setupDOM.value.trim(),
  };

  try {
    await axios.post(`${BASE_URL}/exsercise`, exserciseData);
    Swal.fire({
      text: 'เพิ่มข้อมูลเรียบร้อย',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    }).then(() => {
      window.location.href = "exsercise.html";
    });
  } catch (error) {
    Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มข้อมูลได้', 'error');
  }
};
