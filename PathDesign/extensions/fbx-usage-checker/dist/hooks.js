"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterBuild = void 0;
const package_json_1 = __importDefault(require("../package.json"));
const scene_1 = require("./scene");
const PACKAGE_NAME = package_json_1.default.name;
/*export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function() {
    console.log(PACKAGE_NAME,load);
};

export const onBeforeBuild: BuildHook.onBeforeBuild = async function(options) {
    // Todo some thing
    console.log(PACKAGE_NAME,'onBeforeBuild');
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function(options, result) {
    // Todo some thing
    console.log(PACKAGE_NAME,'onBeforeCompressSettings');
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function(options, result) {
    // Todo some thing
    console.log(PACKAGE_NAME, 'onAfterCompressSettings');
};*/
const onAfterBuild = async function (options, result) {
    console.log(PACKAGE_NAME, 'onAfterBuild');
    await (0, scene_1.QueryAndOutput)();
    console.log(PACKAGE_NAME, 'onAfterBuild finish');
};
exports.onAfterBuild = onAfterBuild;
/*export const unload: BuildHook.unload = async function() {
    console.log(PACKAGE_NAME, 'unload');
};*/ 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvaG9va3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsbUVBQTBDO0FBQzFDLG1DQUF5QztBQUN6QyxNQUFNLFlBQVksR0FBRyxzQkFBVyxDQUFDLElBQUksQ0FBQztBQUV0Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQW1CSTtBQUVHLE1BQU0sWUFBWSxHQUEyQixLQUFLLFdBQVUsT0FBTyxFQUFFLE1BQU07SUFDOUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFN0MsTUFBTSxJQUFBLHNCQUFjLEdBQUUsQ0FBQztJQUVwQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3JELENBQUMsQ0FBQztBQU5XLFFBQUEsWUFBWSxnQkFNdkI7QUFFRjs7SUFFSSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJ1aWxkSG9vayB9IGZyb20gXCJAY29jb3MvY3JlYXRvci10eXBlcy9lZGl0b3IvcGFja2FnZXMvYnVpbGRlci9AdHlwZXMvcHVibGljXCI7XHJcbmltcG9ydCBwYWNrYWdlSlNPTiBmcm9tICcuLi9wYWNrYWdlLmpzb24nO1xyXG5pbXBvcnQgeyBRdWVyeUFuZE91dHB1dCB9IGZyb20gJy4vc2NlbmUnO1xyXG5jb25zdCBQQUNLQUdFX05BTUUgPSBwYWNrYWdlSlNPTi5uYW1lO1xyXG5cclxuLypleHBvcnQgY29uc3QgdGhyb3dFcnJvcjogQnVpbGRIb29rLnRocm93RXJyb3IgPSB0cnVlO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxvYWQ6IEJ1aWxkSG9vay5sb2FkID0gYXN5bmMgZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhQQUNLQUdFX05BTUUsbG9hZCk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgb25CZWZvcmVCdWlsZDogQnVpbGRIb29rLm9uQmVmb3JlQnVpbGQgPSBhc3luYyBmdW5jdGlvbihvcHRpb25zKSB7XHJcbiAgICAvLyBUb2RvIHNvbWUgdGhpbmdcclxuICAgIGNvbnNvbGUubG9nKFBBQ0tBR0VfTkFNRSwnb25CZWZvcmVCdWlsZCcpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IG9uQmVmb3JlQ29tcHJlc3NTZXR0aW5nczogQnVpbGRIb29rLm9uQmVmb3JlQ29tcHJlc3NTZXR0aW5ncyA9IGFzeW5jIGZ1bmN0aW9uKG9wdGlvbnMsIHJlc3VsdCkge1xyXG4gICAgLy8gVG9kbyBzb21lIHRoaW5nXHJcbiAgICBjb25zb2xlLmxvZyhQQUNLQUdFX05BTUUsJ29uQmVmb3JlQ29tcHJlc3NTZXR0aW5ncycpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IG9uQWZ0ZXJDb21wcmVzc1NldHRpbmdzOiBCdWlsZEhvb2sub25BZnRlckNvbXByZXNzU2V0dGluZ3MgPSBhc3luYyBmdW5jdGlvbihvcHRpb25zLCByZXN1bHQpIHtcclxuICAgIC8vIFRvZG8gc29tZSB0aGluZ1xyXG4gICAgY29uc29sZS5sb2coUEFDS0FHRV9OQU1FLCAnb25BZnRlckNvbXByZXNzU2V0dGluZ3MnKTtcclxufTsqL1xyXG5cclxuZXhwb3J0IGNvbnN0IG9uQWZ0ZXJCdWlsZDogQnVpbGRIb29rLm9uQWZ0ZXJCdWlsZCA9IGFzeW5jIGZ1bmN0aW9uKG9wdGlvbnMsIHJlc3VsdCkge1xyXG4gICAgY29uc29sZS5sb2coUEFDS0FHRV9OQU1FLCAnb25BZnRlckJ1aWxkJyk7XHJcbiAgIFxyXG5cdGF3YWl0IFF1ZXJ5QW5kT3V0cHV0KCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coUEFDS0FHRV9OQU1FLCAnb25BZnRlckJ1aWxkIGZpbmlzaCcpO1xyXG59O1xyXG5cclxuLypleHBvcnQgY29uc3QgdW5sb2FkOiBCdWlsZEhvb2sudW5sb2FkID0gYXN5bmMgZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhQQUNLQUdFX05BTUUsICd1bmxvYWQnKTtcclxufTsqLyJdfQ==