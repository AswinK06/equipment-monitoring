FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY EquipmentMonitoring.Api/EquipmentMonitoring.Api.csproj EquipmentMonitoring.Api/
RUN dotnet restore EquipmentMonitoring.Api
COPY EquipmentMonitoring.Api EquipmentMonitoring.Api
RUN dotnet publish EquipmentMonitoring.Api -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "EquipmentMonitoring.Api.dll"]
