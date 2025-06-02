exports.up = function (knex) {
  return knex.schema.table("users", (table) => {
    table.string("password", 255).notNullable(); // Columna para la contraseña encriptada
  });
};

exports.down = function (knex) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("password");
  });
};
