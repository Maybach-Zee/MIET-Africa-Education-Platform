import SwiftUI

struct LoginView: View {
    @Environment(LoginCoordinator.self) private var coordinator
    @State private var viewModel = LoginViewModel()

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "graduationcap.fill")
                .font(.system(size: 64))
                .foregroundStyle(.tint)

            Text("MIET Africa")
                .font(.largeTitle.bold())

            VStack(spacing: 16) {
                TextField("Email", text: $viewModel.email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                    .textFieldStyle(.roundedBorder)

                SecureField("Password", text: $viewModel.password)
                    .textContentType(.password)
                    .textFieldStyle(.roundedBorder)
            }
            .padding(.horizontal)

            if let error = viewModel.errorMessage {
                Text(error)
                    .foregroundStyle(.red)
                    .font(.caption)
            }

            Button {
                Task { await viewModel.login(coordinator: coordinator) }
            } label: {
                if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                } else {
                    Text("Sign In")
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(viewModel.isLoading || !viewModel.isFormValid)
            .padding(.horizontal)

            Button("Forgot Password?") {
                coordinator.navigateToForgotPassword()
            }
            .font(.footnote)

            Spacer()
        }
        .navigationBarHidden(true)
    }
}
