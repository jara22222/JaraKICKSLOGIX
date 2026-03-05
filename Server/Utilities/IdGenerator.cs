using System.Security.Cryptography;

namespace Server.Utilities
{
    public static class IdGenerator
    {
        private const string Base36Alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        public static string Create(string prefix)
        {
            var normalizedPrefix = string.IsNullOrWhiteSpace(prefix)
                ? "ID"
                : prefix.Trim().ToUpperInvariant();
            var timestamp = DateTime.UtcNow.ToString("yyMMddHHmmss");
            var random = RandomBase36(6);
            return $"{normalizedPrefix}-{timestamp}-{random}";
        }

        public static string RandomBase36(int length)
        {
            if (length <= 0)
            {
                return string.Empty;
            }

            Span<char> chars = stackalloc char[length];
            for (var i = 0; i < length; i++)
            {
                var idx = RandomNumberGenerator.GetInt32(0, Base36Alphabet.Length);
                chars[i] = Base36Alphabet[idx];
            }

            return new string(chars);
        }
    }
}
