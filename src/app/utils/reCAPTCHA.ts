export function executeRecaptcha(action: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window["grecaptcha"]) {
      reject("reCAPTCHA not loaded");
    } else {
      window["grecaptcha"].ready(() => {
        window["grecaptcha"].execute("6LfTBR0rAAAAAMA8k0KxEd6ba42FLp3Jjirijrml", { action }).then(resolve).catch(reject);
      });
    }
  });
}
