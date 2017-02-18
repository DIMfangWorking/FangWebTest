*** Settings ***
Library           Selenium2Library

*** Variables ***
${url}            http://172.31.5.200:8000

*** Test Cases ***
case01:start task
    Open Browser    ${url}
    login    test    123456
    Wait Until Page Contains    idle
    Click Link    xpath=(//a[contains(text(),'开始测试')])[2]
    Click Button    id=BeginTest
    Wait Until Page Contains    执行中
    logout
    Close Browser

case02:task history
    Open Browser    ${url}
    login    test    123456
    sleep    1
    click element    id=Sim_resitem0
    ${history}    get text    id=Log_ResHandleHistory
    log    ${history}
    logout
    Close Browser

*** Keywords ***
login
    [Arguments]    ${user}=test    ${password}=123456
    Input Text    id=username    ${user}
    Input Text    id=password    ${password}
    Click Button    id=login_btn

logout
    Click Element    css=a.dropdown-toggle
    Click Element    id=logout
