export const sendWhatsAppMessage = (
  phone: string,
  message: string
) => {
  const cleanedPhone = phone.replace(/\D/g, "");

  // Add India country code if not present
  const formattedPhone = cleanedPhone.startsWith("91")
    ? cleanedPhone
    : `91${cleanedPhone}`;

  const encodedMessage = encodeURIComponent(message);

  const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  window.open(url, "_blank");
};