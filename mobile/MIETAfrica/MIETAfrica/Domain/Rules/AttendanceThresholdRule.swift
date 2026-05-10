import Foundation

enum AttendanceBadge: String, Sendable {
    case green
    case amber
    case red
}

/// Pure domain rule — classifies attendance for a learner per ARCHITECTURE.md §Attendance Threshold Rules.
/// - GREEN  : ≥ 80%
/// - AMBER  : 60–79%
/// - RED    : < 60%, OR 3+ consecutive absences regardless of percentage
enum AttendanceThresholdRule {
    static let greenThreshold: Double = 0.80
    static let amberThreshold: Double = 0.60
    static let consecutiveAbsenceLimit: Int = 3

    /// Records must already be filtered to a single learner; order is irrelevant.
    static func badge(for records: [AttendanceRecordEntity]) -> AttendanceBadge {
        guard !records.isEmpty else { return .green }

        if hasConsecutiveAbsences(records, limit: consecutiveAbsenceLimit) {
            return .red
        }

        let rate = attendanceRate(records)
        if rate < amberThreshold { return .red }
        if rate < greenThreshold { return .amber }
        return .green
    }

    static func attendanceRate(_ records: [AttendanceRecordEntity]) -> Double {
        guard !records.isEmpty else { return 1.0 }
        let present = records.filter(\.isPresent).count
        return Double(present) / Double(records.count)
    }

    /// True if the learner has `limit` or more absences in a row, scanning chronologically.
    static func hasConsecutiveAbsences(_ records: [AttendanceRecordEntity], limit: Int) -> Bool {
        let sorted = records.sorted { $0.date < $1.date }
        var streak = 0
        for record in sorted {
            streak = record.isPresent ? 0 : streak + 1
            if streak >= limit { return true }
        }
        return false
    }

    /// Bulk badge computation. Returns a `[learnerId: badge]` map keyed for O(1) lookup in the UI.
    static func badges(learners: [LearnerEntity], attendance: [AttendanceRecordEntity]) -> [String: AttendanceBadge] {
        let byLearner = Dictionary(grouping: attendance, by: \.learnerId)
        return learners.reduce(into: [:]) { acc, learner in
            acc[learner.id] = badge(for: byLearner[learner.id] ?? [])
        }
    }
}
