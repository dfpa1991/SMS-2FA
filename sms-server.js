// Simple SMS Server
import { Router } from 'express';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const router = Router();

// Helper function to pause execution for the UI to render
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.post('/send-2fa', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: 'Missing phone parameters '});
  }

  const message = `Your verification code is ${code}`;
  const MY_PHONE_PIN = "120812"; // S23 PIN

  try {
    // Check current state on the Samsung S23+ phone
    const { stdout } = await execPromise("adb shell dumpsys power");
    const isScreenAwake = stdout.includes("mScreenOn=true");

    if (!isScreenAwake){
      console.log("Phone is asleep. Executing automated unlock Sequence 📲🔓");
      await execPromise("adb shell input keyevent 26");
      await sleep(500);
      await execPromise(`adb shell input text ${MY_PHONE_PIN} && adb shell input keyevent 66`);
      await sleep(600); // Wait for the home screent animation to complete
      await execPromise("adb shell input keyevent 3");
      await sleep(200);
    } else {
      console.log("Phone is awake. Executing SMS Sequence 📲");
      await execPromise("adb shell input keyevent 3");
      await sleep(200);
    }

    // ---- Working SMS App Sequence ----
    const intentCmd = `adb shell am start -a android.intent.action.SENDTO -d sms:${phone} --es sms_body "'${message}'"`;
    await execPromise(intentCmd);
    await sleep(1200);
    const tapCmd = `adb shell input tap 960 2222`; // Tap on the "Send" button
    await execPromise(tapCmd);
    
    // ---- Lock Phone Sequence ----
    await sleep(1000);
    // ---- Return to Home Sequence ----
    await execPromise("adb shell input keyevent 3");
    await sleep(1000);
    // ---- Lock Phone Sequence ----
    await execPromise("adb shell input keyevent 26");
    await sleep(1000);
    console.log(`SMS sent successfully with the code: ${code}`);
    return res.status(200).json({ success: 'success' });  
  } catch (error) { 
    return res.status(500).json({ status: 'failed', error: error.message });
  }
});

export default router;