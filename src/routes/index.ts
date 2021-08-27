import {Router} from 'express';
import {authFormMw, authMw, multerMemory} from './middleware';
import {login, logout} from './Auth';
import {getAllUsers, addOneUser, updateOneUser, deleteOneUser} from './Users';
import {connectSocketRm, emitMessage} from './Chat';
import {getAllBulks, uploadExcel, uploadText} from "./Bulk";

// Auth router
const authRouter = Router();
authRouter.post('/login', authFormMw, login);
authRouter.get('/logout', logout);
authRouter.post("/register", authFormMw, addOneUser);

// User router
const userRouter = Router();
userRouter.get('/all', getAllUsers);
userRouter.post('/add', authFormMw, addOneUser);
userRouter.put('/update', updateOneUser);
userRouter.delete('/delete/:id', deleteOneUser);

// Chat router
const chatRouter = Router();
chatRouter.get('/connect-socket-room/:socketId', connectSocketRm);
chatRouter.post('/emit-message', emitMessage);

//Bulk router
const bulkRouter = Router();
bulkRouter.get("/all", getAllBulks);
bulkRouter.post("/upload/excel", multerMemory.single("file"), uploadExcel)
bulkRouter.post("/upload/text", uploadText)

// Base router (serves all others)
const baseRouter = Router();
baseRouter.use('/auth', authRouter);
baseRouter.use('/users', authMw, userRouter);
baseRouter.use('/chat', authMw, chatRouter)
baseRouter.use("/bulk", authMw, bulkRouter);

export default baseRouter;
