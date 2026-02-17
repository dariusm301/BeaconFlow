#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_wifi.h"
#include "esp_mac.h"
#include "nvs_flash.h"
#include "esp_now.h"

typedef struct struct_message {
    char mesaj[50];
} __attribute__((packed)) struct_message;

struct_message Mesaj_Test;

void OnDataRecv(const esp_now_recv_info_t *info, const uint8_t *data, int len){
      if (len != sizeof(struct_message)) {
        printf("Date invalide!\n");
        return;
    }
    struct_message *mesaj_primit = (struct_message*)data;
    printf("Mesaj primit: %s\n", mesaj_primit->mesaj);

}
void app_main(void)
{
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
    ESP_ERROR_CHECK(esp_now_register_recv_cb(OnDataRecv));
    while(1){
    vTaskDelay(pdMS_TO_TICKS(1000));
    }  


}
