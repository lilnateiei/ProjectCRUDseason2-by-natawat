const email = localStorage.getItem("email");
const username = localStorage.getItem("username");
console.log(`Username: ${username}, Email: ${email}`);

const api = "https://67950ceeaad755a134eb14bf.mockapi.io/user";

async function verifyJWT(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            return { valid: false, reason: "JWT ไม่สมบูรณ์" };
        }

        // ดึง payload (ส่วนที่สองของ JWT)
        const payload = JSON.parse(atob(parts[1]));

        // ตรวจสอบว่า token หมดอายุหรือไม่
        if (Date.now() > payload.exp * 1000) {
            return { valid: false, reason: "โทเค่นหมดอายุ!" };
        }

        // ตรวจสอบกับฐานข้อมูลว่าผู้ใช้มีอยู่จริงหรือไม่
        const response = await fetch(`${api}/${payload.UserId}`);
        if (!response.ok) {
            return { valid: false, reason: "ไม่พบผู้ใช้งาน" };
        }

        const user = await response.json();

        // ตรวจสอบข้อมูลผู้ใช้ว่าตรงกันหรือไม่
        if (user.email !== email || user.username !== username) {
            return { valid: false, reason: "ข้อมูลผู้ใช้ไม่ตรงกัน" };
        }

        return { valid: true, payload };
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการตรวจสอบ JWT:", error);
        return { valid: false, reason: "ข้อผิดพลาดในการตรวจสอบ JWT" };
    }
}

// ตรวจสอบโทเค่นเมื่อกดปุ่ม "Check JWT"
document.getElementById("checkJwtBtn").addEventListener("click", async function () {
    const token = localStorage.getItem("token");
    if (!token) {
        Swal.fire({
            text: "ไม่พบโทเค่น",
            icon: "error",
            confirmButtonText: "ตกลง"
        });
        return;
    }

    const result = await verifyJWT(token);
    if (!result.valid) {
        if (result.reason === "โทเค่นหมดอายุ!") {
            Swal.fire({
                text: "โทเค่นไม่ถูกต้องหรือหมดอายุ",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
            localStorage.removeItem("token");
        } else {
            Swal.fire({
                text: result.reason,
                icon: "error",
                confirmButtonText: "ตกลง"
            });
        }
    } else {
        Swal.fire({
            text: `Token ถูกต้อง! ยินดีต้อนรับกลับมา, ${result.payload.username}`,
            icon: "success",
            confirmButtonText: "ตกลง"
        });
    }
});

// ออกจากระบบเมื่อกดปุ่ม "Logout"
document.getElementById("logoutBtn").addEventListener("click", function () {
  Swal.fire({
      text: "ออกจากระบบเรียบร้อย! กำลังกลับไปหน้าเข้าสู่ระบบ...",
      icon: "success",
      confirmButtonText: "ตกลง",
      timer: 2000,  // ตั้งเวลาหน่วง 2 วินาที
      showConfirmButton: false  // ไม่ต้องแสดงปุ่ม OK
  });

  setTimeout(() => {
      localStorage.removeItem("token"); // ลบ token ออกจาก localStorage
      window.location.href = "index.html"; // กลับไปหน้า index.html
  }, 2000); // ดีเลย์ 2 วินาทีก่อนเปลี่ยนหน้า
});
