package com.beaconflow.app;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.util.Log;
import android.os.ParcelUuid;
import java.util.UUID;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;


@CapacitorPlugin(
    name = "BluetoothManager",
    permissions = {
        @Permission(
            alias = "bluetooth",
            strings = {
                android.Manifest.permission.BLUETOOTH_ADVERTISE,
                android.Manifest.permission.BLUETOOTH_CONNECT
            }
        )
    }
)
public class BluetoothManagerPlugin extends Plugin {

    private BluetoothLeAdvertiser globalAdvertiser;
    private AdvertiseCallback advertiseCallback;

    @PluginMethod
    public void startAdvertise(PluginCall call) {
        if (getPermissionState("bluetooth") != PermissionState.GRANTED) {
            requestPermissionForAlias("bluetooth", call, "checkPermissionsCallback");
            return;
        }
        actualStartAdvertising(call);
    }

    @PermissionCallback
    private void checkPermissionsCallback(PluginCall call) {
        if (getPermissionState("bluetooth") == PermissionState.GRANTED) {
            actualStartAdvertising(call);
        } else {
            call.reject("Permisiuni refuzate de utilizator.");
        }
    }

    private void actualStartAdvertising(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();

        globalAdvertiser = adapter.getBluetoothLeAdvertiser();
        if (globalAdvertiser == null) {
            call.reject("Bluetooth-ul este oprit.");
            return;
        }

        if (advertiseCallback != null) {
            globalAdvertiser.stopAdvertising(advertiseCallback);
        }

        AdvertiseSettings settings = new AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                .setConnectable(false)
                .build();

        String mIdString = call.getString("manufacturerId");
        String manufacturerData = call.getString("manufacturerData");
        String uuidString = call.getString("uuid");

        int mId;
        byte[] manufacturerDataBytes;
        try {
            mId = Integer.parseInt(mIdString, 16);
            manufacturerDataBytes = manufacturerData.getBytes();

        } catch (NumberFormatException e) {
            mId = 0xFFFF;
            manufacturerDataBytes = new byte[0];
        }

        AdvertiseData data = new AdvertiseData.Builder()
                .setIncludeDeviceName(false)
                .addManufacturerData(mId, manufacturerDataBytes)
                .addServiceUuid(new ParcelUuid(UUID.fromString(uuidString)))
                .build();

        advertiseCallback = new AdvertiseCallback() {
            @Override
            public void onStartSuccess(AdvertiseSettings settingsInEffect) {
                super.onStartSuccess(settingsInEffect);
                JSObject ret = new JSObject();
                ret.put("status", "advertising");
                call.resolve(ret);
            }

            @Override
            public void onStartFailure(int errorCode) {
                super.onStartFailure(errorCode);
                call.reject("Eroare pornire: " + errorCode);
            }
        };

        globalAdvertiser.startAdvertising(settings, data, advertiseCallback);
    }

    @PluginMethod
    public void stopAdvertise(PluginCall call) {
        if (globalAdvertiser != null && advertiseCallback != null) {
            globalAdvertiser.stopAdvertising(advertiseCallback);
            globalAdvertiser = null;
            advertiseCallback = null;
            JSObject ret = new JSObject();
            ret.put("status", "stopped");
            call.resolve(ret);
        } else {
            call.resolve();
        }
    }
}
