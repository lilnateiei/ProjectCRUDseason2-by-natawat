const api = "https://67950ceeaad755a134eb14bf.mockapi.io/user";
const loginForm = document.getElementById("loginForm");

// ฟังก์ชันสร้าง JWT
function createJWT(payload, secret, userId, expiresInSeconds = 120) {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = btoa(JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
        UserId: userId
    }));
    const signature = btoa(`${header}.${body}.${secret}`);
    return `${header}.${body}.${signature}`;
}

// ตรวจสอบ Username & Password
function checkUserCredentials(username, password) {
    return fetch(api)
        .then(response => response.json())
        .then(users => users.find(user => user.username === username && user.password === password));
}

// กดปุ่มล็อกอิน
loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        Swal.fire({
            text: 'กรุณากรอก Username และ Password',
            icon: 'warning',
            confirmButtonText: 'ตกลง'
        });
        return;
    }

    checkUserCredentials(username, password)
        .then(user => {
            if (user) {
                // สร้าง Token & เก็บข้อมูลใน localStorage
                const token = createJWT({ username: user.username }, "mysecret", user.id, 120);
                localStorage.setItem("token", token);
                localStorage.setItem("email", user.email);
                localStorage.setItem("username", user.username);

                // แจ้งเตือน & เปลี่ยนหน้าเมื่อกด "ตกลง"
                Swal.fire({
                    text: 'ล็อกอินสำเร็จ!',
                    icon: 'success',
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    window.location.href = "./home.html";
                });
            } else {
                Swal.fire({
                    text: 'Username หรือ Password ไม่ถูกต้อง!',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                });
            }
        })
        .catch(error => {
            console.error("เกิดข้อผิดพลาดในการตรวจสอบข้อมูลผู้ใช้:", error);
            Swal.fire({
                text: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์',
                icon: 'error',
                confirmButtonText: 'ตกลง'
            });
        });
});
