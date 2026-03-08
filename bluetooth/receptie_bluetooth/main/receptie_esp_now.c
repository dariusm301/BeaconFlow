#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_wifi.h"
#include "esp_mac.h"
#include "nvs_flash.h"
#include "esp_now.h"
char mesaj_calib[]="Stop";
char mesaj_start[]="Start";
char mesaj_fail[]="Fail";

void afiseaza_si_trimite_mac() {
    uint8_t mac[6];
    esp_read_mac(mac, ESP_MAC_WIFI_STA);
    printf("MAC:%02X:%02X:%02X:%02X:%02X:%02X\n",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
}
typedef struct struct_message {
    uint8_t tip;
    char checkpoint;
    char ticket_id[20];


} __attribute__((packed)) esp_now_message;

void monitor_serial_task(void *pvParameters) {
    char c;
    while(1) {
        if (scanf("%c", &c) != EOF) {
            afiseaza_si_trimite_mac();
        }
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}

typedef struct calibrare_mess{
    uint8_t tip;
    char checkpoint;
    bool calib;
}__attribute__((packed)) esp_now_calib;

typedef struct start_mess{
    uint8_t tip;
    char checkpoint;
    bool start;
}__attribute__((packed)) esp_now_start;

typedef struct baterie_mess{
    uint8_t tip;
    char checkpoint;
    uint8_t baterie;

}__attribute__((packed)) esp_now_baterie;

esp_now_message Mesaj_Test;
esp_now_calib Calibrare;
esp_now_start Start;
esp_now_baterie Baterie;

void OnDataRecv(const esp_now_recv_info_t *info, const uint8_t *data, int len){
    uint8_t tip_mesaj = data[0];
    if(tip_mesaj==0){
        esp_now_start *mesaj_primit=(esp_now_start*)data;
        printf("Checkpoint:%c\n", mesaj_primit->checkpoint);
        if(mesaj_primit->start==1){
            printf("Status:%s\n",mesaj_start);
        }
    }
      if(tip_mesaj==1) {
        esp_now_calib *mesaj_primit = (esp_now_calib*)data;
        printf("Checkpoint: %c\n", mesaj_primit->checkpoint);
        if(mesaj_primit->calib==1){
        printf("Status:%s\n",mesaj_calib);
    }
    else{
        printf("Status:%s\n",mesaj_fail);
    }
    }
    if(tip_mesaj==2){
   esp_now_message *mesaj_primit = (esp_now_message*)data;
   printf("Checkpoint:%c\n", mesaj_primit->checkpoint);
   printf("Ticket:%s\n", mesaj_primit->ticket_id);
    }
   if(tip_mesaj == 3) {
    esp_now_baterie *mesaj_primit = (esp_now_baterie*)data;
    printf("Checkpoint:%c\n", mesaj_primit->checkpoint);
    printf("Status:%d%%\n", mesaj_primit->baterie);
}


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
    xTaskCreate(monitor_serial_task, "monitor_serial", 2048, NULL, 5, NULL);
    while(1){
    vTaskDelay(pdMS_TO_TICKS(1000));
    }  


}
