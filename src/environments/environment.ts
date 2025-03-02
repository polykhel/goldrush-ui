export const environment = {
  backendUrl: import.meta.env['NG_APP_BACKEND_URL'],
  fileUrl: import.meta.env['NG_APP_FILE_URL'],
  auth0: {
    domain: import.meta.env['NG_APP_AUTH0_DOMAIN'],
    clientId: import.meta.env['NG_APP_AUTH0_CLIENT_ID'],
    callbackUrl: import.meta.env['NG_APP_AUTH0_CALLBACK_URL'],
    audience: import.meta.env['NG_APP_AUTH0_AUDIENCE'],
  }
};
