import Foundation

/// Thin URLSession wrapper. Repositories call `request(_:body:)` and decode the result themselves.
final class APIClient: Sendable {
    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder

    init(
        baseURL: URL = URL(string: "http://localhost:5000/api")!,
        session: URLSession = .shared
    ) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
    }

    func request<T: Decodable>(
        _ endpoint: APIEndpoint,
        body: (any Encodable)? = nil,
        token: String? = nil
    ) async throws -> T {
        guard let url = URL(string: endpoint.path, relativeTo: baseURL) else {
            throw NetworkError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.unknown(underlying: URLError(.badServerResponse))
        }

        switch httpResponse.statusCode {
        case 200...299: break
        case 401: throw NetworkError.unauthorized
        case 404: throw NetworkError.notFound
        default:  throw NetworkError.serverError(statusCode: httpResponse.statusCode)
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw NetworkError.decodingFailed(underlying: error)
        }
    }
}
