"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobModel = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = mongoose_1.default.Schema;
const userschema = new schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const jobSchema = new schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, require: true, ref: "user" },
    company: { type: String, required: true },
    role: { type: String, required: true },
    dateApplied: { type: Date, default: Date.now },
    link: { type: String, required: true }
});
exports.UserModel = mongoose_1.default.model("user", userschema);
exports.JobModel = mongoose_1.default.model("jobs", jobSchema);
