/**
 * Vercel Serverless Function: /api/tasks
 * Connects with Vercel Postgres (@vercel/postgres) when env vars are present.
 */

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // If Vercel Postgres is connected
  if (process.env.POSTGRES_URL) {
    try {
      const { sql } = await import('@vercel/postgres');

      if (req.method === 'POST') {
        const t = req.body;
        await sql`
          INSERT INTO tasks (
            id, title, company, location_type, category, base_pay, pay_type,
            video_bonus, bonus_condition, has_active_bonus, slots_total, slots_filled,
            duration_minutes, image, description, requirements, equipment_needed,
            posted_date, is_urgent, is_daily_mission, expires_in_hours,
            contractor_phone, contractor_whatsapp, contractor_contact_name,
            city, state, neighborhood, postal_code, latitude, longitude
          ) VALUES (
            ${t.id}, ${t.title}, ${t.company}, ${t.locationType}, ${t.category},
            ${t.basePay}, ${t.payType || 'hora'}, ${t.videoBonus || 0}, ${t.bonusCondition || ''},
            ${t.hasActiveBonus ?? true}, ${t.slotsTotal || 10}, ${t.slotsFilled || 0},
            ${t.durationMinutes || 45}, ${t.image || ''}, ${t.description || ''},
            ${JSON.stringify(t.requirements || [])}, ${JSON.stringify(t.equipmentNeeded || [])},
            ${t.postedDate || 'Hoje'}, ${t.isUrgent || false}, ${t.isDailyMission || false},
            ${t.expiresInHours || 24}, ${t.contractorPhone || null},
            ${t.contractorWhatsapp || null}, ${t.contractorContactName || null},
            ${t.city || 'São Paulo'}, ${t.state || 'SP'}, ${t.neighborhood || null},
            ${t.postalCode || null}, ${t.latitude || null}, ${t.longitude || null}
          )
          ON CONFLICT (id) DO UPDATE SET
            slots_filled = EXCLUDED.slots_filled,
            has_active_bonus = EXCLUDED.has_active_bonus,
            contractor_phone = EXCLUDED.contractor_phone,
            contractor_whatsapp = EXCLUDED.contractor_whatsapp,
            city = EXCLUDED.city,
            neighborhood = EXCLUDED.neighborhood;
        `;
        return res.status(200).json({ success: true, task: t });
      }

      // GET
      const { rows } = await sql`
        SELECT 
          id, title, company, location_type as "locationType", category,
          base_pay as "basePay", pay_type as "payType", video_bonus as "videoBonus",
          bonus_condition as "bonusCondition", has_active_bonus as "hasActiveBonus",
          slots_total as "slotsTotal", slots_filled as "slotsFilled",
          duration_minutes as "durationMinutes", image, description,
          requirements, equipment_needed as "equipmentNeeded",
          posted_date as "postedDate", is_urgent as "isUrgent",
          is_daily_mission as "isDailyMission", expires_in_hours as "expiresInHours",
          expires_at as "expiresAt",
          contractor_phone as "contractorPhone",
          contractor_whatsapp as "contractorWhatsapp",
          contractor_contact_name as "contractorContactName",
          city, state, neighborhood,
          postal_code as "postalCode",
          latitude, longitude
        FROM tasks
        ORDER BY created_at DESC;
      `;
      return res.status(200).json(rows);
    } catch (dbErr: any) {
      console.warn('Vercel Postgres query notice:', dbErr.message);
    }
  }

  // Fallback for mock/local development without database connection string
  if (req.method === 'POST') {
    return res.status(200).json({ success: true, task: req.body });
  }

  return res.status(200).json([]);
}
