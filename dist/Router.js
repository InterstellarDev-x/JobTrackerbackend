"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserRoute = (0, express_1.Router)();
const zod_1 = require("zod");
const db_1 = require("./db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Middleware_1 = __importDefault(require("./Middleware"));
const JWT_SECRET = "StudentTracker";
const RegisteringSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, { message: "Must be atleast 6 charchacter" }),
}); //  schema for registering and singing the user
const JobSchema = zod_1.z.object({
    company: zod_1.z.string({ message: "Please provide the name of company" }),
    role: zod_1.z.string(),
    dateApplied: zod_1.z.coerce.date(),
    link: zod_1.z.string({ message: "Please provide the link" })
});
``;
UserRoute.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const succesRegisterSchema = RegisteringSchema.safeParse(req.body);
    if (!succesRegisterSchema.success) {
        return res.json({
            error: succesRegisterSchema.error.format(),
        });
    }
    const { email, password } = req.body;
    try {
        yield bcrypt_1.default.hash(password, 5, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield db_1.UserModel.create({
                email: email,
                password: hash,
            });
            return res.status(200).json({
                msg: "User successfully registered",
            });
        }));
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            msg: "Server error ",
        });
    }
}));
UserRoute.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const succesRegisterSchema = RegisteringSchema.safeParse(req.body);
    if (!succesRegisterSchema.success) {
        return res.json({
            error: succesRegisterSchema.error.format(),
        });
    }
    const { email, password } = req.body;
    try {
        const user = yield db_1.UserModel.findOne({
            email: email,
        });
        if (!user) {
            return res.status(404).json({
                msg: "User is not found ",
            });
        }
        const passwordSucces = yield bcrypt_1.default.compareSync(password, (user === null || user === void 0 ? void 0 : user.password) || "");
        if (!passwordSucces) {
            return res.status(403).json({
                msg: "Invalid Credientials",
            });
        }
        else {
            const token = jsonwebtoken_1.default.sign({ id: user === null || user === void 0 ? void 0 : user._id }, JWT_SECRET, {
                algorithm: "HS256",
            });
            return res.status(200).json({
                msg: "you are signed in ",
                token: token,
            });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            msg: "Intenal server eroor ",
        });
    }
}));
UserRoute.use(Middleware_1.default);
UserRoute.post("/Jobs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const JobBodyParse = JobSchema.safeParse(req.body);
    if (!JobBodyParse.success) {
        return res.status(403).json({
            msg: JobBodyParse.error.format()
        });
    }
    const { company, link, role, dateApplied } = req === null || req === void 0 ? void 0 : req.body;
    const userId = req.userId;
    try {
        yield db_1.JobModel.create({
            user: userId,
            company: company,
            role: role,
            dateApplied: dateApplied,
            link: link
        });
        res.status(200).json({
            msg: "Posted Succesfully"
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "Internal server Error"
        });
    }
}));
UserRoute.put("/Jobs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { company, link, role, dateApplied } = req === null || req === void 0 ? void 0 : req.body;
    const userId = req.userId;
    try {
        yield db_1.JobModel.findOneAndUpdate({
            _id: id,
            user: userId
        }, {
            company: company,
            link: link,
            role: role,
            dateApplied: dateApplied
        });
        return res.status(200).json({
            msg: "Updated Succesfully"
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            msg: "Internal Server Error"
        });
    }
}));
UserRoute.get("/Jobs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const response = yield db_1.JobModel.find({
            user: userId
        }).populate("user");
        return res.status(200).json(response);
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            msg: "Internal server error"
        });
    }
}));
UserRoute.delete("/Jobs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = req.params.id;
    const userId = req.userId;
    try {
        yield db_1.JobModel.findOneAndDelete({
            user: userId,
            _id: jobId
        });
        return res.status(200).json({
            msg: "Job Deleted"
        });
    }
    catch (e) {
        return res.status(500).json({
            msg: "Intenal Server Error"
        });
    }
}));
exports.default = UserRoute;
