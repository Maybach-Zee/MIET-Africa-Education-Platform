import Foundation

enum MockDataError: LocalizedError {
    case fileNotFound(String)
    case decodingFailed(file: String, underlying: Error)

    var errorDescription: String? {
        switch self {
        case .fileNotFound(let name):
            return "Sample data file '\(name).json' not found in app bundle."
        case .decodingFailed(let name, _):
            return "Failed to decode sample data file '\(name).json'."
        }
    }
}

enum MockJSONLoader {
    static let mockDelay: Duration = .milliseconds(500)

    static func load<T: Decodable>(_ name: String, as type: T.Type = T.self) throws -> T {
        guard let url = Bundle.main.url(forResource: name, withExtension: "json") else {
            throw MockDataError.fileNotFound(name)
        }
        let data = try Data(contentsOf: url)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw MockDataError.decodingFailed(file: name, underlying: error)
        }
    }
}
