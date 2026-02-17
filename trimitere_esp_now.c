#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_wifi.h"
#include "esp_mac.h"
#include "nvs_flash.h"
#include "esp_now.h"

uint8_t broadcastAddress[] = {0x3C, 0x61, 0x05, 0x64, 0xFA, 0x0C};

typedef struct struct_message {
    char mesaj[50];
} __attribute__((packed)) struct_message;

struct_message Mesaj_Test;
esp_now_peer_info_t peerInfo;


void OnDataSent(const wifi_tx_info_t *txInfo, esp_now_send_status_t status) {
    printf("Last Packet Send Status: %s\n",
           status == ESP_NOW_SEND_SUCCESS ? "Delivery Success :)" : "Delivery Fail :(");
}

void app_main(void) {
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_start());

    ESP_ERROR_CHECK(esp_now_init());
    ESP_ERROR_CHECK(esp_now_register_send_cb(OnDataSent));

    memset(&peerInfo, 0, sizeof(peerInfo));
    memcpy(peerInfo.peer_addr, broadcastAddress, 6);
    peerInfo.channel = 0;
    peerInfo.encrypt = false;

    if (esp_now_add_peer(&peerInfo) != ESP_OK) {
        printf("Failed to add peer!\n");
        return;
    }
    printf("Peer adaugat cu succes!\n");

    while (1) {
        strcpy(Mesaj_Test.mesaj, "Hello from ESP32 #1");

        esp_err_t result = esp_now_send(
            broadcastAddress,
            (uint8_t *)&Mesaj_Test,
            sizeof(Mesaj_Test)
        );

        if (result == ESP_OK) {
            printf("Mesaj trimis!\n");
        } else {
            printf("Eroare trimitere: %d\n", result);
        }

        vTaskDelay(pdMS_TO_TICKS(2000));
    }
}