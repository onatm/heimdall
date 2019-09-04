/* eslint-disable babel/camelcase */
const Activation = (schema) => {
  schema.add({ is_active: { type: Boolean, alias: 'isActive', default: true } });
};

export default Activation;
