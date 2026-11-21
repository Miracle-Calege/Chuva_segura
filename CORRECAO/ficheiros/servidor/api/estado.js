// GET /api/estado — diz que partes do servidor estão configuradas (sem revelar nenhuma chave).
import { tratarCors } from '../lib/http.js'
import { redisConfigurado } from '../lib/redis.js'

export default function handler(req, res) {
  if (!tratarCors(req, res, 'GET, OPTIONS')) return
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMERO } = process.env
  res.status(200).json({
    sms: Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_NUMERO),
    comunidade: redisConfigurado(),
  })
}
