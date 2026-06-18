import { proto, initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import { Pool } from 'pg';
import crypto from 'crypto';

export const usePostgresAuthState = async (locationId: string, pool: Pool) => {
  const writeData = async (data: any, key: string) => {
    const value = JSON.stringify(data, BufferJSON.replacer);
    const query = `
      INSERT INTO "WhatsappAuth" ("id", "locationId", "key", "value") 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT ("locationId", "key") 
      DO UPDATE SET "value" = $4
    `;
    await pool.query(query, [crypto.randomUUID(), locationId, key, value]);
  };

  const readData = async (key: string) => {
    const res = await pool.query(`SELECT "value" FROM "WhatsappAuth" WHERE "locationId" = $1 AND "key" = $2`, [locationId, key]);
    if (res.rows.length > 0) {
      return JSON.parse(res.rows[0].value, BufferJSON.reviver);
    }
    return null;
  };

  const removeData = async (key: string) => {
    await pool.query(`DELETE FROM "WhatsappAuth" WHERE "locationId" = $1 AND "key" = $2`, [locationId, key]);
  };

  const creds = await readData('creds') || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: { [key: string]: any } = {};
          await Promise.all(
            ids.map(async id => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data: any) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              if (value) {
                tasks.push(writeData(value, key));
              } else {
                tasks.push(removeData(key));
              }
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => writeData(creds, 'creds')
  };
};
