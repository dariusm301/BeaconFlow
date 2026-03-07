#include <stdio.h>
#include <string.h>
#include <math.h> 
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include "esp_bt.h"
#include "esp_gap_ble_api.h"
#include "esp_bt_main.h"
#include "esp_wifi.h"
#include "esp_mac.h"
#include "esp_now.h"
#include "esp_timer.h"
static const uint8_t TARGET_SERVICE_UUID[16] = {
    0x9a, 0xd1, 0x0a, 0xdb, 0x80, 0x45, 0x12, 0xa4, 
    0xec, 0x4b, 0x7d, 0x4f, 0x7a, 0x19, 0x62, 0x80
};
uint8_t broadcastAddress[] = {0x3C, 0x61, 0x05, 0x64, 0xFA, 0x0C};
#define MAX_PASSENGERS 100
char ticket[20];
#define PATH_LOSS_INDEX     2.5f    
#define PROCESS_NOISE       0.020f
#define CALIBRATION_SAMPLES 100
#define BATTERY_CAPACITY 8000
#define CONSUM_BLE_SCAN_MA  100.0f
#define CONSUM_IDLE_MA      45.0f
#define CONSUM_ESP_NOW 150.0f
float measurement_noise_R = 5.0f;
bool is_calibrated = false;
bool start_status=true;
bool mesaj_sent=false;          
float dynamic_rssi_1m = -59.0f;       
float calibration_sum = 0.0f;
float calibration_sq_sum = 0.0f;        
int calibration_count = 0;
float mAh_ramas = BATTERY_CAPACITY;
uint64_t last_time_check = 0;
uint8_t baterie_procent = 100;
uint8_t ultima_baterie_transmisa = 101;

esp_now_peer_info_t peerInfo;         
typedef struct struct_message {
    uint8_t tip;
    char checkpoint;
    char ticket_id[20];


} __attribute__((packed)) esp_now_message;

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

typedef struct {
    float Q;           
    float R;           
    float x_est_last;  
    float P_last;      
} KalmanFilter;
typedef struct {
    char ticket_id[20];
    KalmanFilter kf;
    uint32_t last_seen;
    bool is_active;
    bool sent;
} Passenger;

bool update_battery_status() {
    uint64_t now = esp_timer_get_time(); 
    if (last_time_check == 0) { last_time_check = now; return false; }
    float delta_hours = (float)(now - last_time_check) / 1000000.0f / 3600.0f; 
    float consum_actual = (is_calibrated) ? CONSUM_BLE_SCAN_MA : CONSUM_IDLE_MA;
    mAh_ramas -= (consum_actual * delta_hours);
    last_time_check = now;
    uint8_t procent_nou = (uint8_t)((mAh_ramas / BATTERY_CAPACITY) * 100.0f);
    if (mAh_ramas <= 0) { mAh_ramas = 0; procent_nou = 0; }
    if (procent_nou != ultima_baterie_transmisa) {
        baterie_procent = procent_nou;
        return true; 
    }
    
    return false;
}

Passenger passengers[MAX_PASSENGERS];


KalmanFilter kf;

esp_now_message Mesaj;


void Kalman_Init(KalmanFilter* k, float process_noise, float measurement_noise, float initial_value) {
    k->Q = process_noise;
    k->R = measurement_noise;
    k->x_est_last = initial_value;
    k->P_last = 1.0f; 
}


float Kalman_Update(KalmanFilter* k, float raw_val) {
   
    float P_temp = k->P_last + k->Q; 
    float K = P_temp / (P_temp + k->R);
    float x_est = k->x_est_last + K * (raw_val - k->x_est_last);
    float P = (1 - K) * P_temp;
    k->P_last = P;
    k->x_est_last = x_est;    
    return x_est;
}




bool adv_data_find_UUID(uint8_t *adv_data, uint8_t adv_data_len, const uint8_t *TARGET_SERVICE_UUID,char *out_ticket_id) {
    uint8_t *p_data = adv_data;
    uint8_t data_len = adv_data_len;
    bool uuid_found = false;
    bool ticket_id_found = false;
     uint8_t id_len =0;
    while (data_len > 0) {
        uint8_t field_len = *p_data++;
        data_len--;
        if (field_len == 0 || data_len < field_len) break;
        uint8_t field_type = *p_data++;
        data_len--;
        
        if (field_type == 0x06 || field_type == 0x07) { 
            uint8_t uuid_len = field_len - 1;
            if (uuid_len ==16 && memcmp(p_data, TARGET_SERVICE_UUID,16) == 0) {
                uuid_found=true;
            }
        }
        else if(field_type==0xFF){
            if(field_len>3)
            id_len = field_len - 3;
            memcpy(out_ticket_id, p_data + 2, id_len);
            out_ticket_id[id_len] = '\0';
            ticket_id_found = true;

        }
        p_data += (field_len - 1);
        data_len -= (field_len - 1);
    }
    return (uuid_found && ticket_id_found);
}

static esp_ble_scan_params_t ble_scan_params = {
    .scan_type = BLE_SCAN_TYPE_ACTIVE,
    .own_addr_type = BLE_ADDR_TYPE_PUBLIC,
    .scan_filter_policy = BLE_SCAN_FILTER_ALLOW_ALL,
    .scan_interval = 0xA0, 
    .scan_window = 0xA0,  
    .scan_duplicate = BLE_SCAN_DUPLICATE_DISABLE 
};

void OnDataSent(const wifi_tx_info_t *txInfo, esp_now_send_status_t status) {
    printf("Last Packet Send Status: %s\n",
           status == ESP_NOW_SEND_SUCCESS ? "Delivery Success :)" : "Delivery Fail :(");
}

void send_espnow_message(Passenger* p) {
    esp_now_message msg;
    msg.tip=2;
    msg.checkpoint='B';
    memcpy(msg.ticket_id,p->ticket_id,sizeof(p->ticket_id));
    p->sent = true;
    esp_err_t result = esp_now_send(broadcastAddress,(uint8_t *)&msg,sizeof(esp_now_message));


}
void send_espnow_calibration(bool calib_status) {
    esp_now_calib cal;
    cal.tip=1;
    cal.calib = calib_status;
    cal.calib=1;
    cal.checkpoint='B';
    esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *)&cal, sizeof(esp_now_calib));
    if (result == ESP_OK) {
        printf("Calibration message sent: %s\n", calib_status ? "TRUE" : "FALSE");
    } else {
        printf("Calibration send failed: %d\n", result);
    }
}
void send_espnow_start(bool start_status){
    if(mesaj_sent==true){
        return;
    }
    esp_now_start start;
    start.tip=0;
    start.start = 1;
    start.checkpoint='B';
    esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *)&start, sizeof(esp_now_start));
    if (result == ESP_OK) {
        printf("Starting calibration message sent: %s\n", start_status ? "TRUE" : "FALSE");
    } else {
        printf("Starting calibration send failed: %d\n", result);
    }
}

void send_espnow_battery() {
    esp_now_baterie batt_msg;
    batt_msg.tip = 3;
    batt_msg.baterie = baterie_procent;
    batt_msg.checkpoint='B';
    esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *)&batt_msg, sizeof(esp_now_baterie));
    if (result == ESP_OK) {
    printf(">>> Status Baterie Trimis: %d%%\n", baterie_procent);
        ultima_baterie_transmisa = baterie_procent;
    }
}
void battery_monitor_task(void *pvParameters) {
    while (1) {
        if (update_battery_status()) {
            send_espnow_battery();
        }
        
        vTaskDelay(pdMS_TO_TICKS(10000));
    }
}
void monitor_tasks_status(void *pvParameters) {
    char buffer[400]; 
    
    while (1) {
        printf("\n--- Task Status List ---\n");
        printf("Name          State  Priority  Stack   Num\n");
        
        vTaskList(buffer);
        printf("%s", buffer);
        
        printf("------------------------\n");
        vTaskDelay(pdMS_TO_TICKS(20000));
    }
}

static void esp_gap_cb(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param) {
    
    
    if (event == ESP_GAP_BLE_SCAN_PARAM_SET_COMPLETE_EVT) {
        esp_ble_gap_start_scanning(0);
    } 
    
    
    else if (event == ESP_GAP_BLE_SCAN_RESULT_EVT) {
        esp_ble_gap_cb_param_t *scan = (esp_ble_gap_cb_param_t *)param;
        
        if (scan->scan_rst.search_evt == ESP_GAP_SEARCH_INQ_RES_EVT) {
            
            char current_ticket[20];
            if (adv_data_find_UUID(scan->scan_rst.ble_adv, scan->scan_rst.adv_data_len, TARGET_SERVICE_UUID,current_ticket)) {
    
    int raw_rssi = scan->scan_rst.rssi;
    int index=-1;
    
    if (!is_calibrated) {
        send_espnow_start(start_status);
        mesaj_sent=true;
        calibration_sum += raw_rssi;
        calibration_sq_sum += (raw_rssi * raw_rssi);
        calibration_count++;
        
        printf("CALIBRARE... %d/%d (Raw RSSI: %d)\n", calibration_count, CALIBRATION_SAMPLES, raw_rssi);
        
        if (calibration_count >= CALIBRATION_SAMPLES) {
            float mean_rssi = calibration_sum / (float)CALIBRATION_SAMPLES;
            dynamic_rssi_1m = mean_rssi;
            float variance = (calibration_sq_sum / (float)CALIBRATION_SAMPLES) - (mean_rssi * mean_rssi);
            if (variance < 0.1f) variance = 0.1f; 
            measurement_noise_R = variance;
            
            
            Kalman_Init(&kf, PROCESS_NOISE, measurement_noise_R, dynamic_rssi_1m);
            
            is_calibrated = true;
            send_espnow_calibration(is_calibrated);
            
            printf("\n--- CALIBRARE MEDIU COMPLETA ---\n");
            printf("Referinta (Mean) la 1m: %.2f dBm\n", dynamic_rssi_1m);
            printf("Zgomot Masurat (R): %.4f (Varianta calculata)\n", measurement_noise_R);
            printf("------------------------------\n\n");
        }
    } 
    else {
        for (int i = 0; i < MAX_PASSENGERS; i++) {
        if (passengers[i].is_active && strcmp(passengers[i].ticket_id, current_ticket) == 0) {
            index = i;
            break;
        }
    }

    if (index == -1) {
        for (int i = 0; i < MAX_PASSENGERS; i++) {
            if (!passengers[i].is_active) {
                index = i;
                strcpy(passengers[index].ticket_id, current_ticket);
                Kalman_Init(&passengers[index].kf, PROCESS_NOISE, measurement_noise_R, (float)raw_rssi);
                passengers[index].is_active = true;
                break;
            }
        }
    }

    if (index != -1) {
        float filtered_rssi = Kalman_Update(&passengers[index].kf, (float)raw_rssi);
        float ratio = (dynamic_rssi_1m - filtered_rssi) / (10.0f * PATH_LOSS_INDEX);
        float dist_m = pow(10.0f, ratio);
        if(dist_m<1.0f&&passengers[index].sent==false){
            send_espnow_message(&passengers[index]);

        }
        
        printf("Bilet: %s | RSSI: %d | Distanta: %.2f m\n", passengers[index].ticket_id, raw_rssi, dist_m);
    }
}
    }
}
}
    }

void app_main(void) {
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    ESP_ERROR_CHECK(esp_bt_controller_mem_release(ESP_BT_MODE_CLASSIC_BT));
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
    esp_now_add_peer(&peerInfo);

    Kalman_Init(&kf, PROCESS_NOISE, measurement_noise_R, dynamic_rssi_1m);
    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    esp_bt_controller_init(&bt_cfg);
    esp_bt_controller_enable(ESP_BT_MODE_BLE);
    esp_bluedroid_init();
    esp_bluedroid_enable();
    esp_ble_gap_register_callback(esp_gap_cb);
    esp_ble_gap_set_scan_params(&ble_scan_params);
    xTaskCreate(battery_monitor_task, "battery_task", 3072, NULL, 5, NULL);
    xTaskCreate(monitor_tasks_status, "monitor_task", 4096, NULL, 1, NULL);
    printf("--- SYSTEM READY ---\n");
    printf("Legend: Raw_RSSI, Filtered_RSSI, Distance(m)\n");
}
