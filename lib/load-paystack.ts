// utils/load-paystack.ts
export const loadPaystackScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById("paystack-script")) {
      return resolve(true)
    }

    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.id = "paystack-script"
    script.onload = () => resolve(true)
    document.body.appendChild(script)
  })
}
