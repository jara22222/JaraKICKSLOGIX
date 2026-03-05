using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Text;

namespace Server.Services
{
    public interface IEmailSenderService
    {
        Task<bool> SendAsync(string toEmail, string subject, string htmlBody);
    }

    public class EmailSenderService : IEmailSenderService
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<EmailSenderService> _logger;
        private static readonly Regex ResetTokenRegex =
            new(@"(token=)[^&'""\s]+", RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private const string ResendApiUrl = "https://api.resend.com/emails";

        public EmailSenderService(
            IConfiguration configuration,
            IWebHostEnvironment environment,
            ILogger<EmailSenderService> logger)
        {
            _configuration = configuration;
            _environment = environment;
            _logger = logger;
        }

        public async Task<bool> SendAsync(string toEmail, string subject, string htmlBody)
        {
            var resendApiKey = GetSetting("Email:ApiKey", "KICKSLOGIX_EMAIL_API_KEY");
            var fromEmail = GetSetting("Email:FromEmail", "KICKSLOGIX_EMAIL_FROM");
            var fromName = GetSetting("Email:FromName", "KICKSLOGIX_EMAIL_FROM_NAME") ?? "KicksLogix";

            if (!string.IsNullOrWhiteSpace(resendApiKey))
            {
                return await SendViaResendAsync(
                    resendApiKey,
                    toEmail,
                    subject,
                    htmlBody,
                    fromEmail,
                    fromName);
            }

            if (_environment.IsDevelopment())
            {
                _logger.LogWarning(
                    "Resend API key not configured. Email to {ToEmail} skipped in development. Subject: {Subject}",
                    toEmail,
                    subject);
                _logger.LogInformation("Email body preview: {Body}", RedactResetToken(htmlBody));
                return false;
            }

            throw new InvalidOperationException("Resend API key is not configured.");
        }

        private async Task<bool> SendViaResendAsync(
            string apiKey,
            string toEmail,
            string subject,
            string htmlBody,
            string? fromEmail,
            string fromName)
        {
            var senderEmail = string.IsNullOrWhiteSpace(fromEmail)
                ? "onboarding@resend.dev"
                : fromEmail;

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", apiKey);

            var payload = new
            {
                from = $"{fromName} <{senderEmail}>",
                to = new[] { toEmail },
                subject,
                html = htmlBody
            };
            using var content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");
            var response = await client.PostAsync(ResendApiUrl, content);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            _logger.LogError(
                "Resend email sending failed. Status: {StatusCode}. Response: {Response}",
                (int)response.StatusCode,
                responseBody);

            throw new InvalidOperationException($"Resend rejected email request: {responseBody}");
        }

        private string? GetSetting(string configurationKey, params string[] envKeys)
        {
            var value = _configuration[configurationKey];
            if (!string.IsNullOrWhiteSpace(value))
            {
                return value;
            }

            foreach (var envKey in envKeys)
            {
                var envValue =
                    Environment.GetEnvironmentVariable(envKey, EnvironmentVariableTarget.Process) ??
                    Environment.GetEnvironmentVariable(envKey, EnvironmentVariableTarget.User) ??
                    Environment.GetEnvironmentVariable(envKey, EnvironmentVariableTarget.Machine);
                if (!string.IsNullOrWhiteSpace(envValue))
                {
                    return envValue;
                }
            }

            return null;
        }

        private static string RedactResetToken(string htmlBody)
        {
            if (string.IsNullOrWhiteSpace(htmlBody))
            {
                return htmlBody;
            }

            return ResetTokenRegex.Replace(htmlBody, "$1[REDACTED]");
        }

    }
}
