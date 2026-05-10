import Foundation

enum NetworkError: LocalizedError {
    case invalidURL
    case unauthorized
    case notFound
    case serverError(statusCode: Int)
    case decodingFailed(underlying: Error)
    case unknown(underlying: Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:       return "Invalid URL."
        case .unauthorized:     return "Session expired. Please log in again."
        case .notFound:         return "Resource not found."
        case .serverError(let code): return "Server error (\(code))."
        case .decodingFailed:   return "Failed to process server response."
        case .unknown(let e):   return e.localizedDescription
        }
    }
}
