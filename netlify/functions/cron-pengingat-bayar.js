// Netlify Scheduled Function: Pengingat Batas Bayar Tinggal 3 Jam
// Otomatis berjalan setiap 15 menit di Netlify infrastructure

exports.config = {
  schedule: "@every 15m",
};

exports.handler = async (event, context) => {
  const cronSecret = process.env.CRON_SECRET || "pijar_aksara_cron_secret_secure_key_123";
  const appUrl = process.env.URL || "https://lms-pijar-aksara.netlify.app";

  console.log("[Netlify Scheduled Cron] Memulai eksekusi pengingat bayar...");

  try {
    const response = await fetch(`${appUrl}/api/cron/pengingat-bayar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log("[Netlify Scheduled Cron] Sukses mengeksekusi:", result);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("[Netlify Scheduled Cron] Gagal mengeksekusi:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
