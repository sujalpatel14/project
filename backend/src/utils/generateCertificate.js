import path from "path";
import fs from "fs-extra";

export default function generateCertificate(student, course, percentage) {
  const bgImagePath = `file://${path.join(process.cwd(), "src/certificates/assets/image.png")}`;


  return `
 <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Completion</title>
    <style>
        body {
            font-family: 'Montserrat', sans-serif; /* Modern font */
            background: linear-gradient(to bottom, #f0f8ff, #e1f5fe); /* Soft gradient background */
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }

        .certificate {
            margin: 20px 20px;
            width: 85%;
            max-width: 850px;
            background: linear-gradient(135deg, #fffaf0, #f0fff0); /* Warm light gradient */
            border: 2px solid #b19cd9; /* Soft lavender border */
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
            padding: 70px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .certificate::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.3); /* Subtle light overlay */
            z-index: 0;
        }

        .header {
            margin-bottom: 45px;
            position: relative;
            z-index: 1;
        }

        .logo {
            font-size: 34px;
            font-weight: 700;
            color: #880e4f; /* Deep magenta logo */
            margin-bottom: 12px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
        }

        .title {
            font-size: 42px;
            font-weight: 800;
            color: #2e3d49; /* Dark slate grey title */
            margin-bottom: 22px;
            text-transform: uppercase;
            letter-spacing: 4px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
        }

        .certify-text {
            font-size: 22px;
            color: #556b2f; /* Dark olive green */
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }

        .name {
            font-size: 38px;
            font-weight: 700;
            color: #4a148c; /* Deep purple name */
            margin-bottom: 12px;
            text-transform: capitalize;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
            position: relative;
            z-index: 1;
        }

        .course-details {
            font-size: 20px;
            color: #333;
            position: relative;
            z-index: 1;
        }

        .course-title {
            font-style: italic;
            font-weight: 600;
            color: #9c27b0; /* Violet course title */
        }

        .percentage {
            font-weight: 700;
            color: #228b22; /* Forest green percentage */
            font-size: 22px;
        }

        .signature {
            margin-top: 50px;
            display: flex;
            justify-content: space-around;
            position: relative;
            z-index: 1;
        }

        .signature div {
            border-top: 2px solid #a9a9a9;
            padding-top: 12px;
            width: 40%;
            text-align: center;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>

<body>
    <div class="certificate">
        <div class="header">
            <div class="logo">Codeverse</div>
            <div class="title">CERTIFICATE OF COMPLETION</div>
        </div>

        <div class="content">
            <p class="certify-text">This is to certify that</p>
            <p class="name">${student.name}</p>
            <div class="course-details">
                has successfully completed the <span class="course-title">${course.title}</span> course
                with a score of <span class="percentage">${percentage}%</span>.
            </div>
        </div>

        <div class="signature">
            <div>
                Presented By Codeverse
            </div>
        </div>
    </div>
</body>

</html>
  `;
}







