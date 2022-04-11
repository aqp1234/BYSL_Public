1. visual studio code
2. open Folder
3. ctrl + ` 로 터미널 열기
4. python -m venv venv
5. venv\Scripts\activate.bat  (가상환경 실행)
6. npm i (만약 오류나면 package-lock.json, node_modules 삭제 후 재 입력)
7. config/config.json 에 
"username": "root",
"password": "password",
"database": "MIT",
각자 맞는 내용으로 설정
8. .env 파일 생성후
MONGO_ID=
MONGO_PASSWORD=
각자 맞는 내용으로 작성 // ""필요 X
9. npx sequelize db:create (db테이블 생성)
10. mongodb 서버 실행
11. npm start