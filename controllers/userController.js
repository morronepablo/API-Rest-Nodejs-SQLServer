const knex = require("../config/database");
const bcrypt = require("bcrypt");

// Función para encriptar la contraseña
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const getAllUsers = async (req, res) => {
  try {
    console.log("Ejecutando GetAllUsers...");
    const users = await knex.raw("EXEC GetAllUsers");
    console.log("Resultado de knex.raw:", JSON.stringify(users, null, 2)); // Depuración completa

    let userData = [];
    if (users.recordset && users.recordset.length > 0) {
      console.log("Usando recordset");
      userData = users.recordset;
    } else if (users.rows && users.rows.length > 0) {
      console.log("Usando rows");
      userData = users.rows;
    } else if (Array.isArray(users) && users.length > 0) {
      console.log("Usando array raíz");
      userData = users;
    } else {
      console.log("No se encontraron datos en recordset, rows ni array raíz");
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message, error.stack); // Depuración detallada
    res
      .status(500)
      .json({ error: "Error al obtener usuarios", details: error.message });
  }
};

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Nombre, email y contraseña son requeridos" });
    }

    const hashedPassword = await hashPassword(password);
    const result = await knex.raw(
      "EXEC CreateUser @Name=?, @Email=?, @Password=?",
      [name, email, hashedPassword]
    );

    console.log(
      "Resultado completo de knex.raw:",
      JSON.stringify(result, null, 2)
    );

    let userData;
    if (result && result.recordset && result.recordset.length > 0) {
      userData = result.recordset[0];
    } else if (result && result.length > 0 && result[0].id) {
      userData = result[0];
    } else {
      const newUser = await knex("users").where({ email }).first();
      if (newUser) {
        userData = { id: newUser.id, name: newUser.name, email: newUser.email };
      } else {
        return res
          .status(500)
          .json({
            error: "No se pudieron obtener los datos del usuario creado",
          });
      }
    }

    res.status(201).json(userData);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al crear usuario", details: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
    if (!name || !email) {
      return res.status(400).json({ error: "Nombre y email son requeridos" });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    const result = await knex.raw(
      "EXEC UpdateUser @Id=?, @Name=?, @Email=?, @Password=?",
      [id, name, email, hashedPassword]
    );

    if (result.returnValue === -1) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let updatedUserData;
    if (result && result.recordset && result.recordset.length > 0) {
      updatedUserData = result.recordset[0];
    } else {
      const updatedUser = await knex("users").where({ id }).first();
      if (updatedUser) {
        updatedUserData = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        };
      } else {
        return res
          .status(500)
          .json({
            error: "No se pudieron obtener los datos del usuario actualizado",
          });
      }
    }

    res.json(updatedUserData);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar usuario", details: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await knex.raw("EXEC DeleteUser @Id=?", [id]);
    if (result.returnValue === -1) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
