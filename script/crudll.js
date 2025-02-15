const BASE_URL = "https://679ccfb987618946e6537ec9.mockapi.io/";
const TOKEN_KEY = "token";   
const SECRET_KEY = "mysecret";   

let mode = "ADD"; 
let selectedId = null; 

const checkToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    window.location.href = "./index.html";
    return false;
  }
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) {
      window.location.href = "./index.html";
      return false;
    }
    const validSignature = btoa(`${header}.${body}.${SECRET_KEY}`);
    if (signature !== validSignature) {
      window.location.href = "./index.html";
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
      window.location.href = "./index.html";  
      return false;
    }
    return true;
  } catch (error) {
    console.error("ข้อผิดพลาดในการตรวจสอบ token:", error);
    window.location.href = "./index.html";
    return false;
  }
};

window.onload = () => {
  if (!checkToken()) {
    Swal.fire({
      text: 'โทเค่นไม่ถูกต้องหรือหมดอายุ',
      icon: 'warning',
      confirmButtonText: 'ตกลง'
    });
    window.location.href = "./index.html";
    return;
  }
  initializeCRUD();
};

const initializeCRUD = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (id) {
    mode = "EDIT";
    selectedId = id;
    try {
      const response = await axios.get(`${BASE_URL}/course/${id}`);
      const course = response.data;
      if (course) {
        document.querySelector("input[name=langue]").value = course.langue || "";
        document.querySelector("input[name=hour]").value = course.hour || "";
        document.querySelector("input[name=des]").value = course.des || "";
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
};

const validateData = (courseData) => {
  if (!courseData.langue) {
    Swal.fire({
      text: 'กรุณากรอกภาษาที่จะสอนในคอร์ส',
      icon: 'warning',
      confirmButtonText: 'ตกลง'
    });
    return false;
  }
  if (!courseData.hour) {
    Swal.fire({
      text: 'กรุณากรอกชั่วโมงที่จะเรียนในคอร์ส',
      icon: 'warning',
      confirmButtonText: 'ตกลง'
    });
    return false;
  }
  if (!courseData.des) {
    Swal.fire({
      text: 'กรุณากรอกคำอธิบาย',
      icon: 'warning',
      confirmButtonText: 'ตกลง'
    });
    return false;
  }
  return true;
};

const submitData = async () => {
  const courseData = {
    langue: document.querySelector("input[name=langue]").value,
    hour: document.querySelector("input[name=hour]").value,
    des: document.querySelector("input[name=des]").value,
  };

  if (!validateData(courseData)) {
    return; // หยุดการทำงานถ้าข้อมูลไม่ครบ
  }

  try {
    let response;
    let successText = "";

    if (mode === "EDIT") {
      response = await axios.put(`${BASE_URL}/course/${selectedId}`, courseData);
      successText = 'แก้ไขข้อมูลเรียบร้อย';
    } else {
      response = await axios.post(`${BASE_URL}/course`, courseData);
      successText = 'เพิ่มข้อมูลเรียบร้อย';
    }

    Swal.fire({
      text: successText,
      icon: 'success',
      confirmButtonText: 'ตกลง'
    }).then(() => {
      window.location.href = "./course.html"; // กลับไปที่หน้าหลักหลังจากกดตกลง
    });

  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      text: 'เกิดข้อผิดพลาดในการส่งข้อมูล',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    });
  }
};
