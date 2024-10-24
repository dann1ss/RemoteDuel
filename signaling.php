<?php
// signaling.php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Speichere die SDP-Daten oder ICE-Kandidaten in einer Datenbank oder Datei
    file_put_contents('signaling_data.json', json_encode($data));

    echo json_encode(['status' => 'success']);
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Lade die gespeicherten SDP-Daten oder ICE-Kandidaten
    if (file_exists('signaling_data.json')) {
        echo file_get_contents('signaling_data.json');
    } else {
        echo json_encode(['error' => 'No data found']);
    }
}
