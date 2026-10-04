using EquipmentMonitoring.Api.Services;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using StackExchange.Redis;

namespace EquipmentMonitoring.Api.Extensions;

public static class CacheExtensions
{
    public static IServiceCollection AddAppCache(this IServiceCollection services, IConfiguration cfg)
    {
        var redisConn = cfg["Redis:ConnectionString"];
        if (!string.IsNullOrWhiteSpace(redisConn))
        {
            var redisOptions = ConfigurationOptions.Parse(redisConn);
            redisOptions.AbortOnConnectFail = false;
            redisOptions.ConnectTimeout = 1000;
            redisOptions.SyncTimeout = 1000;

            services.AddStackExchangeRedisCache(o =>
            {
                o.ConfigurationOptions = redisOptions;
                o.InstanceName = "EquipmentMonitoring:";
            });
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        services.AddScoped<ICacheService, CacheService>();

        return services;
    }
}
