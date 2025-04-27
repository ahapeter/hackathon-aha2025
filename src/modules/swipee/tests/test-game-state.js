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
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var TEST_PRESENTATION_ID = 'test-presentation-123';
var BASE_URL = 'http://localhost:3000';
// Sample game configuration
var sampleConfig = {
    presentationId: TEST_PRESENTATION_ID,
    slideId: 'slide-1',
    questions: [
        {
            id: 'q1',
            options: [
                { title: 'Yes', imageUrl: '', isCorrect: true },
                { title: 'No', imageUrl: '', isCorrect: false }
            ]
        },
        {
            id: 'q2',
            options: [
                { title: 'Yes', imageUrl: '', isCorrect: true },
                { title: 'No', imageUrl: '', isCorrect: false }
            ]
        }
    ]
};
// Sample game state
var sampleState = {
    isStarted: true,
    currentQuestionIndex: 0,
    timeSpent: 0
};
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var event_1, score, response, error_1, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 10, , 11]);
                    console.log('Starting game state API tests...\n');
                    // Test 1: Save game state
                    console.log('Test 1: Saving game state...');
                    return [4 /*yield*/, axios_1.default.post("".concat(BASE_URL, "/api/game-state"), {
                            presentationId: TEST_PRESENTATION_ID,
                            config: sampleConfig,
                            state: sampleState
                        })];
                case 1:
                    _c.sent();
                    console.log('✅ Game state saved successfully\n');
                    // Test 2: Add game event
                    console.log('Test 2: Adding game event...');
                    event_1 = {
                        event_name: 'STARTED',
                        event_time: Date.now(),
                        presentationId: TEST_PRESENTATION_ID
                    };
                    return [4 /*yield*/, axios_1.default.put("".concat(BASE_URL, "/api/game-state"), {
                            type: 'event',
                            presentationId: TEST_PRESENTATION_ID,
                            data: event_1
                        })];
                case 2:
                    _c.sent();
                    console.log('✅ Game event added successfully\n');
                    // Test 3: Add score
                    console.log('Test 3: Adding score...');
                    score = {
                        presentationId: TEST_PRESENTATION_ID,
                        activityId: 'activity-1',
                        audienceId: 'audience-1',
                        audienceName: 'Test User',
                        audienceEmoji: '👋',
                        score: 100
                    };
                    return [4 /*yield*/, axios_1.default.put("".concat(BASE_URL, "/api/game-state"), {
                            type: 'score',
                            presentationId: TEST_PRESENTATION_ID,
                            data: score
                        })];
                case 3:
                    _c.sent();
                    console.log('✅ Score added successfully\n');
                    // Test 4: Load game state
                    console.log('Test 4: Loading game state...');
                    return [4 /*yield*/, axios_1.default.get("".concat(BASE_URL, "/api/game-state?presentationId=").concat(TEST_PRESENTATION_ID))];
                case 4:
                    response = _c.sent();
                    console.log('Game state loaded:', JSON.stringify(response.data, null, 2));
                    console.log('✅ Game state loaded successfully\n');
                    // Test 5: Delete game state
                    console.log('Test 5: Deleting game state...');
                    return [4 /*yield*/, axios_1.default.delete("".concat(BASE_URL, "/api/game-state?presentationId=").concat(TEST_PRESENTATION_ID))];
                case 5:
                    _c.sent();
                    console.log('✅ Game state deleted successfully\n');
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, axios_1.default.get("".concat(BASE_URL, "/api/game-state?presentationId=").concat(TEST_PRESENTATION_ID))];
                case 7:
                    _c.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _c.sent();
                    if (((_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                        console.log('✅ Verified game state was deleted\n');
                    }
                    return [3 /*break*/, 9];
                case 9:
                    console.log('All tests completed successfully! 🎉');
                    return [3 /*break*/, 11];
                case 10:
                    error_2 = _c.sent();
                    console.error('Test failed:', ((_b = error_2 === null || error_2 === void 0 ? void 0 : error_2.response) === null || _b === void 0 ? void 0 : _b.data) || error_2.message);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
runTests();
