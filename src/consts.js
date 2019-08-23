const responseTypeIdToken = 'id_token';
const responseTypeToken = 'token';

const supportedResponseTypes = [responseTypeToken, responseTypeIdToken, `${responseTypeIdToken} ${responseTypeToken}`];

export { supportedResponseTypes, responseTypeToken, responseTypeIdToken };
