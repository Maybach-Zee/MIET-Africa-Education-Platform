import Foundation
import Security

enum KeychainError: LocalizedError {
    case unexpectedItemData
    case unhandled(status: OSStatus)

    var errorDescription: String? {
        switch self {
        case .unexpectedItemData:
            return "Unexpected data format in Keychain item."
        case .unhandled(let status):
            return "Keychain error \(status): \(SecCopyErrorMessageString(status, nil) as String? ?? "unknown")."
        }
    }
}

/// Stores the JWT in the iOS Keychain. POPIA-compliant — never UserDefaults.
final class KeychainService: Sendable {
    private let service: String
    private let account: String

    init(service: String = "za.co.lehana.gerald.MIETAfrica",
         account: String = "jwt-token") {
        self.service = service
        self.account = account
    }

    func saveToken(_ token: String) throws {
        guard let data = token.data(using: .utf8) else {
            throw KeychainError.unexpectedItemData
        }

        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]

        let attributes: [String: Any] = [
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]

        let updateStatus = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)

        switch updateStatus {
        case errSecSuccess:
            return
        case errSecItemNotFound:
            var addQuery = query
            addQuery[kSecValueData as String] = data
            addQuery[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            let addStatus = SecItemAdd(addQuery as CFDictionary, nil)
            guard addStatus == errSecSuccess else {
                throw KeychainError.unhandled(status: addStatus)
            }
        default:
            throw KeychainError.unhandled(status: updateStatus)
        }
    }

    func getToken() throws -> String? {
        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String:  true,
            kSecMatchLimit as String:  kSecMatchLimitOne
        ]

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)

        switch status {
        case errSecSuccess:
            guard let data = item as? Data,
                  let token = String(data: data, encoding: .utf8) else {
                throw KeychainError.unexpectedItemData
            }
            return token
        case errSecItemNotFound:
            return nil
        default:
            throw KeychainError.unhandled(status: status)
        }
    }

    func deleteToken() throws {
        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.unhandled(status: status)
        }
    }
}
