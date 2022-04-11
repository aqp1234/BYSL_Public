# pip install mysql-connector-python
# cannot import name 'InvalidSchemeCombination' from 'pip._internal.exceptions' 해당 오류가 나면 터미널에 python get-pip.py 실행
# 서버 npm start 한번 한 후에 python insert.py 실행시 db에 들어감
# 1번만 실행하면 됨 

import mysql.connector

mydb = mysql.connector.connect(
    host="localhost",
    user="username", # config/config.json 에 있는 내용과 동일하게 설정 필요
    password="password", # config/config.json 에 있는 내용과 동일하게 설정 필요
    database="nct",
)

mycursor = mydb.cursor()

sql = "INSERT INTO permissions (content_type_id, codename, name) values (%s, %s, %s)"
val = [
    (1, "Add_Chat_Room", "Can add Chat Room"),
    (1, "Delete_Chat_Room", "Can delete Chat Room"),
    (1, "View_Chat_Room", "Can view Chat Room"),
    (2, "Add_Dashboard", "Can add Dashboard"),
    (2, "Delete_Dashboard", "Can delete Dashboard"),
    (2, "View_Dashboard", "Can view Dashboard"),
    (2, "Change_Dashboard", "Can change Dashboard"),
    (3, "Add_Calendar", "Can add Calendar"),
    (3, "Delete_Calendar", "Can delete Calendar"),
    (3, "View_Calendar", "Can view Calendar"),
    (4, "Add_Conference", "Can add Conference"),
    (4, "Delete_Conference", "Can delete Conference"),
    (4, "View_Conference", "Can view Conference"),
    (4, "Change_Conference", "Can change Conference"),
    (5, "Add_Share", "Can add Share"),
    (5, "Delete_Share", "Can delete Share"),
    (5, "View_Share", "Can view Share"),
    (5, "Change_Share", "Can change Share"),
    (6, "Can_Invite", "Can Invite"),
    (6, "Can_Reject_Invite", "Can reject Invite"),
    (7, "Can_Add_Group", "Can add Group"),
    (7, "Can_Delete_Group", "Can delete Group"),
    (7, "Can_View_Group", "Can view Group"),
    (7, "Can_Change_Group", "Can change Group"),
    (8, "Can_Change_User_Group", "Can change User Group"),
]

mycursor.executemany(sql, val)

mydb.commit()

# pip 오류 같은거 나면 그냥 아래 내용 mysqlworkbench에 입력해서 데이터베이스 입력 해주면 됨
# insert into nct.permissions(content_type_id, codename, name)
# values
#     (1, "Add_Chat_Room", "Can add Chat Room"),
#     (1, "Delete_Chat_Room", "Can delete Chat Room"),
#     (1, "View_Chat_Room", "Can view Chat Room"),
#     (2, "Add_Dashboard", "Can add Dashboard"),
#     (2, "Delete_Dashboard", "Can delete Dashboard"),
#     (2, "View_Dashboard", "Can view Dashboard"),
#     (2, "Change_Dashboard", "Can change Dashboard"),
#     (3, "Add_Calendar", "Can add Calendar"),
#     (3, "Delete_Calendar", "Can delete Calendar"),
#     (3, "View_Calendar", "Can view Calendar"),
#     (4, "Add_Conference", "Can add Conference"),
#     (4, "Delete_Conference", "Can delete Conference"),
#     (4, "View_Conference", "Can view Conference"),
#     (4, "Change_Conference", "Can change Conference"),
#     (5, "Add_Share", "Can add Share"),
#     (5, "Delete_Share", "Can delete Share"),
#     (5, "View_Share", "Can view Share"),
#     (5, "Change_Share", "Can change Share"),
#     (6, "Can_Invite", "Can Invite"),
#     (6, "Can_Reject_Invite", "Can reject Invite"),
#     (7, "Can_Add_Group", "Can add Group"),
#     (7, "Can_Delete_Group", "Can delete Group"),
#     (7, "Can_View_Group", "Can view Group"),
#     (7, "Can_Change_Group", "Can change Group"),
#     (8, "Can_Change_User_Group", "Can change User Group")