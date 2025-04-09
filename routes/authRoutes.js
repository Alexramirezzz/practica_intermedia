const express = require("express");
const { register, validateEmail, login, updatePersonalData, updateCompanyData,  updateAutonomo, getUser, deleteUser, recoverPassword, inviteColleague } = require("../controllers/authController");
const { updateLogo } = require('../controllers/updatelogo');
const authMiddleware = require("../middlewares/verificationToken");
const validateEmailCode = require("../validators/validateEmail");
const validateLogin = require("../validators/validateLogin"); 
const validatePersonalData = require("../validators/validatePersonalData");
const validateCompanyData = require("../validators/validateCompanyData");
const upload = require("../middlewares/upload");
const router = express.Router();

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Crear una nueva cuenta de usuario
 *     description: Crea una cuenta de usuario con email y contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente, devuelve un token JWT
 *       400:
 *         description: Error en los datos de entrada (email o contraseña faltante)
 *       409:
 *         description: El email ya está registrado
 */
router.post("/user/register", register);

router.post("/register", register);

router.put("/user/validation",authMiddleware, validateEmailCode, validateEmail);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Permite a un usuario iniciar sesión con su email y contraseña, devolviendo un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve el token de sesión
 *       401:
 *         description: Credenciales incorrectas
 */
router.post("/user/login", validateLogin, login);

/**
 * @swagger
 * /api/user/validation:
 *   put:
 *     summary: Validar el correo electrónico con un código
 *     description: Verifica un código de 6 dígitos enviado al email del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Correo verificado correctamente
 *       400:
 *         description: El código es incorrecto o ha expirado
 */
router.put("/user/validation", authMiddleware, validateEmailCode, validateEmail);


router.post("/login", validateLogin, login);

/**
 * @swagger
 * /api/user:
 *   put:
 *     summary: Actualizar los datos personales
 *     description: Permite al usuario actualizar su nombre, apellidos y NIF.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surnames:
 *                 type: string
 *               nif:
 *                 type: string
 *     responses:
 *       200:
 *         description: Datos personales actualizados correctamente
 *       400:
 *         description: Error al actualizar los datos
 */
router.put("/user", authMiddleware, validatePersonalData, updatePersonalData);

/**
 * @swagger
 * /api/user/company:
 *   patch:
 *     summary: Actualizar los datos de la compañía
 *     description: Permite al usuario actualizar los datos de su compañía.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *               cif:
 *                 type: string
 *               street:
 *                 type: string
 *               number:
 *                 type: integer
 *               postal:
 *                 type: integer
 *               city:
 *                 type: string
 *               province:
 *                 type: string
 *     responses:
 *       200:
 *         description: Datos de la compañía actualizados correctamente
 *       400:
 *         description: Error al actualizar los datos
 */
router.patch("/user/company", authMiddleware, validateCompanyData, updateCompanyData);


router.put("/user/register", authMiddleware, validatePersonalData, updatePersonalData);

// Ruta para actualizar los datos de la compañía del usuario
router.patch("/user/company", authMiddleware, validateCompanyData, updateCompanyData);

/**
 * @swagger
 * /api/user/autonomo:
 *   patch:
 *     summary: Actualizar si el usuario es autónomo
 *     description: Permite al usuario actualizar su estado de autónomo.
 *     responses:
 *       200:
 *         description: Estado de autónomo actualizado correctamente
 *       400:
 *         description: Error al actualizar el estado
 */
router.patch("/user/autonomo", authMiddleware, updateAutonomo);

/**
 * @swagger
 * /api/user/logo:
 *   patch:
 *     summary: Actualizar el logo del usuario
 *     description: Permite al usuario actualizar su logo.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo actualizado correctamente
 *       400:
 *         description: Error al actualizar el logo
 */
router.patch('/user/logo', authMiddleware, upload.single('logo'), updateLogo); 

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Obtener los datos del usuario
 *     description: Obtiene los datos del usuario autenticado.
 *     responses:
 *       200:
 *         description: Datos del usuario obtenidos correctamente
 *       401:
 *         description: No autorizado
 */
router.get("/user", authMiddleware, getUser);


/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Eliminar el usuario
 *     description: Permite eliminar al usuario de forma física.
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       400:
 *         description: Error al eliminar el usuario
 */
router.delete("/user", authMiddleware, deleteUser);


/**
 * @swagger
 * /api/user/recover:
 *   post:
 *     summary: Recuperar la contraseña
 *     description: Permite recuperar la contraseña del usuario.
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado
 *       400:
 *         description: Error al enviar el correo de recuperación
 */
router.post("/user/recover", recoverPassword);


/**
 * @swagger
 * /api/user/invite:
 *   post:
 *     summary: Invitar a un compañero
 *     description: Permite al usuario invitar a otro usuario a formar parte de su compañía.
 *     responses:
 *       200:
 *         description: Invitación enviada correctamente
 *       400:
 *         description: Error al enviar la invitación
 */
router.post("/user/invite", authMiddleware, inviteColleague);

module.exports = router;