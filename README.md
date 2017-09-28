#introduction

bike2go - demo a complete bike-sharing solution, which include 3 independent projects : 

device + mobile app + server

1.mobile app based on Wechat mini app framework.
refer to github.com/hutualive/bike2go-app

2.device based on STM32F401 MCU + BlueNRG-MS BLE.
refer to github.com/hutualive/bike2go-bike

3.server based on nodejs, express, mongodb framework.
refer to github.com/hutualive/bike2go-server

#how to use it

0.prepare a STM32F401 Nucleo board(NUCLEO-F401RE) and  a BlueNRG-MS expansion board(X-NUCLEO-IDB05A1), you can refer to www.st.vom/stm32ode, online shop or local distributor

1.download or git clone https://github.com/hutualive/bike2go-bike.git

2.connect your board, locate Node.bin from application folder(Application/EWARM/Debug/Exe/Node.bin), drap & drop to the USB disk(typically displayed as NUCLEo(D:)). it will flash the board with the bike device firmware.

3.downloa or git clone https://github.com/hutualive/bike2go-app.git. in the qr-code folder, use Wechat to scan the QR code of bike2go-experience.jpg, it will trigger the mini app of bike2go.

4.tap scan-to-unlock button in the UI of bike2go mini app, scan the QR code 86012188.png inside the qr-code folder. the app will connect to your board and perform the unlock action.

5.push the blue button on the board, trigger the lock event.

6.the UI on the mini app will indicate different user interaction process.

7.the LED on board will flash differently to indicate the state transit: on ready -> LED off, on connected -> LED toggle, on unlocked -> LED on, on locked -> LED toggle 5s, on terminated -> LED off.

8.to change the bike_id and use different QR code, for example 86012000, you need use IAR EWARM IDE to open the bike2go-bike project file and config the BIKE_NAME to your favorite(here for example 86012000). you can generate your favorite QR code through many online services.

9.that's all, enjoy and happy coding to improve further. 