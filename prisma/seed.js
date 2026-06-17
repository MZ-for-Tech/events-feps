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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// DB Seed Script
var client_1 = require("@prisma/client");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminPwd, admin, lecPwd, lecturer, taPwd, ta, stuPwd, student, courses;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('[Seed] Seeding FEPS Hub database...');
                    return [4 /*yield*/, bcryptjs_1.default.hash('admin1234', 12)];
                case 1:
                    adminPwd = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@feps.edu.eg' },
                            update: {},
                            create: { name: 'Platform Admin', email: 'admin@feps.edu.eg', password: adminPwd, role: 'ADMIN' },
                        })];
                case 2:
                    admin = _a.sent();
                    console.log('[OK]', admin.email);
                    return [4 /*yield*/, bcryptjs_1.default.hash('lecturer123', 12)];
                case 3:
                    lecPwd = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'dr.hassan@feps.edu.eg' },
                            update: {},
                            create: { name: 'Dr. Ahmed Hassan', email: 'dr.hassan@feps.edu.eg', password: lecPwd, role: 'LECTURER' },
                        })];
                case 4:
                    lecturer = _a.sent();
                    console.log('[OK] Lecturer:', lecturer.email);
                    return [4 /*yield*/, bcryptjs_1.default.hash('ta123456', 12)];
                case 5:
                    taPwd = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'sara.ta@feps.edu.eg' },
                            update: {},
                            create: { name: 'Sara Khalil', email: 'sara.ta@feps.edu.eg', password: taPwd, role: 'TEACHING_ASSISTANT' },
                        })];
                case 6:
                    ta = _a.sent();
                    console.log('[OK] TA:', ta.email);
                    return [4 /*yield*/, bcryptjs_1.default.hash('student1', 12)];
                case 7:
                    stuPwd = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'omar@feps.edu.eg' },
                            update: {},
                            create: { name: 'Omar Mostafa', email: 'omar@feps.edu.eg', password: stuPwd, role: 'STUDENT' },
                        })];
                case 8:
                    student = _a.sent();
                    console.log('[OK] Student:', student.email);
                    return [4 /*yield*/, Promise.all([
                            prisma.course.upsert({
                                where: { code: 'ECON201' },
                                update: {},
                                create: { code: 'ECON201', nameEn: 'Microeconomics', nameAr: 'الاقتصاد الجزئي', department: 'economics', semester: 'Spring', year: 2026 },
                            }),
                            prisma.course.upsert({
                                where: { code: 'ECON302' },
                                update: {},
                                create: { code: 'ECON302', nameEn: 'Macroeconomics', nameAr: 'الاقتصاد الكلي', department: 'economics', semester: 'Spring', year: 2026 },
                            }),
                            prisma.course.upsert({
                                where: { code: 'POLS101' },
                                update: {},
                                create: { code: 'POLS101', nameEn: 'Introduction to Political Science', nameAr: 'مقدمة في العلوم السياسية', department: 'political-science', semester: 'Spring', year: 2026 },
                            }),
                            prisma.course.upsert({
                                where: { code: 'STAT201' },
                                update: {},
                                create: { code: 'STAT201', nameEn: 'Statistics for Economists', nameAr: 'الإحصاء للاقتصاديين', department: 'statistics', semester: 'Spring', year: 2026 },
                            }),
                        ])];
                case 9:
                    courses = _a.sent();
                    console.log('[OK] Created', courses.length, 'courses');
                    console.log('\n[Done] Seed complete!');
                    console.log('┌─────────────────────────────────────────────┐');
                    console.log('│  Demo credentials:                          │');
                    console.log('│  Admin   admin@feps.edu.eg / admin1234      │');
                    console.log('│  Lecturer dr.hassan@feps.edu.eg / lecturer123│');
                    console.log('│  TA      sara.ta@feps.edu.eg / ta123456     │');
                    console.log('│  Student omar@feps.edu.eg / student1        │');
                    console.log('└─────────────────────────────────────────────┘');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) { console.error(e); process.exit(1); })
    .finally(function () { return prisma.$disconnect(); });
