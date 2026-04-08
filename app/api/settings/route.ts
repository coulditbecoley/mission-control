import { promises as fs } from 'fs';
import path from 'path';

const SETTINGS_FILE = '/docker/mission_control/settings-data.json';

interface Settings {
  phemex: {
    apiKey: string;
    apiSecret: string;
    enabled: boolean;
    lastSync?: string;
  };
  dashboard: {
    theme: 'dark' | 'light';
    refreshInterval: number;
    notifications: boolean;
  };
  trading: {
    defaultCurrency: string;
    showPnlPercent: boolean;
  };
}

const DEFAULT_SETTINGS: Settings = {
  phemex: {
    apiKey: '',
    apiSecret: '',
    enabled: false,
    lastSync: undefined,
  },
  dashboard: {
    theme: 'dark',
    refreshInterval: 30,
    notifications: true,
  },
  trading: {
    defaultCurrency: 'USD',
    showPnlPercent: true,
  },
};

async function readSettings(): Promise<Settings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

async function writeSettings(settings: Settings): Promise<void> {
  const dir = path.dirname(SETTINGS_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Failed to write settings:', error);
  }
}

export async function GET() {
  const settings = await readSettings();
  
  // Don't expose full API secret in response - return masked version
  return Response.json({
    settings: {
      ...settings,
      phemex: {
        ...settings.phemex,
        apiSecret: settings.phemex.apiSecret ? '••••••••••••••••' : '',
        apiKey: settings.phemex.apiKey ? settings.phemex.apiKey.substring(0, 8) + '••••••••' : '',
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, settings: newSettings } = body;

    let settings = await readSettings();

    if (action === 'update-phemex') {
      settings.phemex = {
        ...settings.phemex,
        ...newSettings.phemex,
      };
    } else if (action === 'update-dashboard') {
      settings.dashboard = {
        ...settings.dashboard,
        ...newSettings.dashboard,
      };
    } else if (action === 'update-trading') {
      settings.trading = {
        ...settings.trading,
        ...newSettings.trading,
      };
    } else if (action === 'test-phemex') {
      // Test Phemex connection
      const https = require('https');
      const crypto = require('crypto');

      const expiry = Math.floor(Date.now() / 1000) + 60;
      const message = `GET/v1/positions${expiry}`;
      const signature = crypto
        .createHmac('sha256', newSettings.phemex.apiSecret)
        .update(message)
        .digest('hex');

      return new Promise((resolve) => {
        const options = {
          hostname: 'api.phemex.com',
          port: 443,
          path: '/v1/positions',
          method: 'GET',
          headers: {
            'x-phemex-access-token': newSettings.phemex.apiKey,
            'x-phemex-request-expiry': expiry.toString(),
            'x-phemex-request-signature': signature,
          },
          timeout: 5000,
        };

        const req = https.request(options, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (response.code === 0 || response.data) {
                resolve(
                  Response.json({
                    success: true,
                    message: 'Phemex API connection successful!',
                  })
                );
              } else {
                resolve(
                  Response.json({
                    success: false,
                    message: `Phemex error: ${response.msg || 'Unknown error'}`,
                  })
                );
              }
            } catch (e) {
              resolve(
                Response.json({
                  success: false,
                  message: 'Invalid response from Phemex API',
                })
              );
            }
          });
        });

        req.on('error', (error: any) => {
          resolve(
            Response.json({
              success: false,
              message: `Connection error: ${error.message}`,
            })
          );
        });

        req.end();
      });
    }

    await writeSettings(settings);
    
    return Response.json({
      success: true,
      settings: {
        ...settings,
        phemex: {
          ...settings.phemex,
          apiSecret: settings.phemex.apiSecret ? '••••••••••••••••' : '',
          apiKey: settings.phemex.apiKey ? settings.phemex.apiKey.substring(0, 8) + '••••••••' : '',
        },
      },
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return Response.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
