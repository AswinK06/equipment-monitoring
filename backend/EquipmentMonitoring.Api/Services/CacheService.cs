using System.Text.Json;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.Extensions.Caching.Distributed;

namespace EquipmentMonitoring.Api.Services;

public class CacheService(IDistributedCache cache, ILogger<CacheService> logger) : ICacheService
{
    public async Task<T?> GetAsync<T>(string key)
    {
        try
        {
            var bytes = await cache.GetAsync(key);
            if (bytes == null || bytes.Length == 0)
            {
                logger.LogDebug("Cache miss: {Key}", key);
                return default;
            }

            logger.LogDebug("Cache hit: {Key}", key);
            return JsonSerializer.Deserialize<T>(bytes);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache get failed for key: {Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan ttl)
    {
        try
        {
            var bytes = JsonSerializer.SerializeToUtf8Bytes(value);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl
            };
            await cache.SetAsync(key, bytes, options);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache set failed for key: {Key}", key);
        }
    }

    public async Task RemoveAsync(string key)
    {
        try
        {
            await cache.RemoveAsync(key);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache remove failed for key: {Key}", key);
        }
    }
}
