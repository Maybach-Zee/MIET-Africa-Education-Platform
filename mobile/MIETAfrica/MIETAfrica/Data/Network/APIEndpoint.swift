import Foundation

enum APIEndpoint {
    // Auth
    case login
    case logout
    case refreshToken

    // Courses
    case courses

    // AttendanceRecordEntity
    case attendance
    case recordAttendance

    // Learners
    case learners

    // Alerts
    case alerts

    var path: String {
        switch self {
        case .login:            return "/auth/login"
        case .logout:           return "/auth/logout"
        case .refreshToken:     return "/auth/refresh"
        case .courses:          return "/courses"
        case .attendance:       return "/attendance"
        case .recordAttendance: return "/attendance"
        case .learners:         return "/learners"
        case .alerts:           return "/alerts"
        }
    }

    var method: String {
        switch self {
        case .login, .logout, .recordAttendance: return "POST"
        default: return "GET"
        }
    }
}
