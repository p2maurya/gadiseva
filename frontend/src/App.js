import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, getLocation, GOODS_TYPES, VEHICLE_TYPES, VEHICLE_EMOJI, calcFare } from './utils/api';

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --saffron: #FF6B1A;
    --saffron-dark: #D94F0A;
    --saffron-light: #FF8C4A;
    --saffron-pale: #FFF3EB;
    --green: #2E7D32;
    --green-mid: #388E3C;
    --green-light: #4CAF50;
    --green-pale: #E8F5E9;
    --blue: #1565C0;
    --blue-light: #1976D2;
    --blue-pale: #E3F2FD;
    --yellow: #F9A825;
    --red: #C62828;
    --red-pale: #FFEBEE;
    --bg: #FFF8F3;
    --card: #FFFFFF;
    --text: #1A1A1A;
    --text-mid: #444444;
    --text-soft: #777777;
    --border: #E8D5C4;
    --border-mid: #D4B8A0;
    --radius: 18px;
    --radius-sm: 12px;
    --radius-xs: 8px;
    --shadow: 0 2px 12px rgba(255,107,26,0.10);
    --shadow-md: 0 4px 20px rgba(255,107,26,0.15);
    --shadow-lg: 0 8px 32px rgba(255,107,26,0.18);
  }

  html, body {
    height: 100%;
    font-family: 'Baloo 2', 'Noto Sans Devanagari', sans-serif;
    background: #F0E8DF;
    color: var(--text);
    -webkit-tap-highlight-color: transparent;
  }
  
  #root { min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
  
  .app {
    display: flex; flex-direction: column; min-height: 100vh;
    width: 100%; max-width: 480px;
    background: var(--card);
    position: relative;
    box-shadow: 0 0 60px rgba(0,0,0,0.15);
  }

  /* ── HEADER ─────────────────────────────────── */
  .header {
    background: linear-gradient(135deg, var(--saffron) 0%, var(--saffron-dark) 100%);
    padding: 14px 18px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 200;
    box-shadow: 0 2px 12px rgba(200,60,0,0.3);
  }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .header-icon { font-size: 26px; line-height: 1; }
  .header-title { color: white; font-size: 20px; font-weight: 800; line-height: 1; letter-spacing: -0.3px; }
  .header-sub { color: rgba(255,255,255,0.82); font-size: 11px; font-weight: 500; margin-top: 1px; }
  .back-btn {
    background: rgba(255,255,255,0.22); border: none; color: white;
    border-radius: 50%; width: 34px; height: 34px; font-size: 17px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .back-btn:active { background: rgba(255,255,255,0.38); transform: scale(0.93); }

  /* ── SCROLL AREA ─────────────────────────────── */
  .scroll-area { overflow-y: auto; flex: 1; -webkit-overflow-scrolling: touch; padding-bottom: 48px; }

  /* ── HOME HERO ───────────────────────────────── */
  .hero {
    background: linear-gradient(150deg, #FF6B1A 0%, #FF8C4A 45%, #F9A825 100%);
    padding: 40px 24px 52px; text-align: center; position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; top: -50px; right: -50px;
    width: 220px; height: 220px; border-radius: 50%;
    background: rgba(255,255,255,0.07);
  }
  .hero::after {
    content: ''; position: absolute; bottom: -30px; left: -40px;
    width: 160px; height: 160px; border-radius: 50%;
    background: rgba(255,255,255,0.05);
  }
  .hero-truck { font-size: 70px; display: block; margin-bottom: 14px; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.2)); animation: bounce 2.5s ease-in-out infinite; }
  @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  .hero h1 { color: white; font-size: 30px; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
  .hero p { color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 6px; font-weight: 500; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.35);
    color: white; font-size: 12px; font-weight: 600;
    border-radius: 20px; padding: 4px 12px; margin-top: 12px;
  }

  /* ── ROLE CARDS ──────────────────────────────── */
  .role-section { padding: 24px 18px; display: flex; flex-direction: column; gap: 14px; }
  .role-card {
    border-radius: var(--radius); padding: 18px 20px;
    display: flex; align-items: center; gap: 16px;
    cursor: pointer; border: 2px solid transparent;
    transition: all 0.18s; position: relative; overflow: hidden;
    -webkit-user-select: none; user-select: none;
  }
  .role-card:active { transform: scale(0.97); }
  .role-card::after {
    content: '›'; position: absolute; right: 18px;
    font-size: 24px; color: rgba(0,0,0,0.2); font-weight: 400;
  }
  .rc-customer  { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border-color: #90CAF9; }
  .rc-driver    { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border-color: #A5D6A7; }
  .rc-admin     { background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border-color: #FFCC80; }
  .role-emoji   { font-size: 46px; flex-shrink: 0; }
  .role-info h3 { font-size: 17px; font-weight: 700; color: var(--text); }
  .role-info p  { font-size: 13px; color: var(--text-soft); margin-top: 3px; font-weight: 500; }

  /* ── TABS ────────────────────────────────────── */
  .tabs { display: flex; background: var(--bg); border-bottom: 2px solid var(--border); }
  .tab {
    flex: 1; padding: 14px 8px; text-align: center;
    font-size: 13px; font-weight: 600; color: var(--text-soft);
    border-bottom: 3px solid transparent; cursor: pointer;
    transition: all 0.15s; margin-bottom: -2px; font-family: inherit;
  }
  .tab.active { color: var(--saffron); border-bottom-color: var(--saffron); background: white; }

  /* ── SECTION ─────────────────────────────────── */
  .section { padding: 0 18px; margin-top: 20px; }
  .section-title {
    font-size: 11px; font-weight: 700; color: var(--text-soft);
    text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 10px;
  }

  /* ── FORM ────────────────────────────────────── */
  .form-group { margin-bottom: 14px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-mid); margin-bottom: 6px; }
  .form-input {
    width: 100%; padding: 13px 15px; font-size: 16px; font-family: inherit;
    border: 2px solid var(--border); border-radius: var(--radius-sm);
    background: white; color: var(--text);
    transition: border-color 0.15s, box-shadow 0.15s; outline: none;
  }
  .form-input:focus { border-color: var(--saffron); box-shadow: 0 0 0 3px rgba(255,107,26,0.10); }
  .form-input::placeholder { color: #BBBBBB; }
  .form-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' fill='none' stroke-width='2'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
    padding-right: 42px;
  }

  /* ── GOODS GRID ──────────────────────────────── */
  .goods-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .goods-btn {
    background: white; border: 2px solid var(--border);
    border-radius: var(--radius-sm); padding: 12px 8px;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    cursor: pointer; transition: all 0.15s; font-family: inherit;
  }
  .goods-btn:active { transform: scale(0.95); }
  .goods-btn.selected { border-color: var(--saffron); background: var(--saffron-pale); }
  .goods-btn-emoji { font-size: 26px; line-height: 1; }
  .goods-btn-label { font-size: 12px; font-weight: 600; color: var(--text-mid); text-align: center; }

  /* ── GPS BUTTON ──────────────────────────────── */
  .gps-btn {
    width: 100%; display: flex; align-items: center; gap: 12px;
    background: var(--blue-pale); border: 2px solid #90CAF9;
    border-radius: var(--radius-sm); padding: 14px 16px;
    cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 600;
    color: var(--blue); transition: all 0.15s;
  }
  .gps-btn:active { transform: scale(0.97); }
  .gps-pulse {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--green-light); flex-shrink: 0;
    box-shadow: 0 0 0 3px rgba(76,175,80,0.25);
    animation: glow 2s ease-in-out infinite;
  }
  @keyframes glow {
    0%,100% { box-shadow: 0 0 0 3px rgba(76,175,80,0.25); }
    50% { box-shadow: 0 0 0 6px rgba(76,175,80,0.08); }
  }

  /* ── BUTTONS ─────────────────────────────────── */
  .btn {
    width: 100%; padding: 15px; font-size: 16px; font-weight: 700;
    font-family: inherit; border: none; border-radius: var(--radius-sm);
    cursor: pointer; transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn:active { transform: scale(0.97); }
  .btn:disabled { opacity: 0.6; pointer-events: none; }
  .btn-saffron { background: linear-gradient(135deg, var(--saffron), var(--saffron-dark)); color: white; box-shadow: 0 4px 16px rgba(255,107,26,0.32); }
  .btn-green   { background: linear-gradient(135deg, var(--green-light), var(--green)); color: white; box-shadow: 0 4px 16px rgba(46,125,50,0.28); }
  .btn-blue    { background: linear-gradient(135deg, var(--blue-light), var(--blue)); color: white; box-shadow: 0 4px 16px rgba(21,101,192,0.28); }
  .btn-red     { background: linear-gradient(135deg, #EF5350, var(--red)); color: white; box-shadow: 0 4px 16px rgba(198,40,40,0.28); }
  .btn-outline { background: transparent; border: 2px solid var(--border); color: var(--text-soft); box-shadow: none; }
  .btn-sm      { padding: 9px 16px; font-size: 13px; width: auto; border-radius: var(--radius-xs); }

  /* ── VEHICLE CARDS ───────────────────────────── */
  .vehicle-list { padding: 12px 18px; display: flex; flex-direction: column; gap: 12px; }
  .vehicle-card {
    background: white; border: 2px solid var(--border);
    border-radius: var(--radius); padding: 16px;
    cursor: pointer; transition: all 0.18s;
  }
  .vehicle-card:active { transform: scale(0.98); }
  .vehicle-card.selected { border-color: var(--saffron); background: var(--saffron-pale); box-shadow: var(--shadow-md); }
  .vc-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .vc-avatar {
    width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--saffron-light), var(--saffron));
    display: flex; align-items: center; justify-content: center; font-size: 24px;
  }
  .vc-name { font-size: 16px; font-weight: 700; }
  .vc-type { font-size: 13px; color: var(--saffron); font-weight: 600; margin-top: 2px; }
  .vc-dist { font-size: 12px; color: var(--text-soft); margin-top: 2px; }
  .vc-rating { font-size: 13px; font-weight: 600; color: #E65100; }
  .vc-trips  { font-size: 11px; color: var(--text-soft); font-weight: 600; margin-top: 3px; }
  .vc-bottom { margin-top: 12px; display: flex; gap: 8px; align-items: center; }
  .call-btn {
    background: linear-gradient(135deg, var(--green-light), var(--green));
    color: white; border: none; border-radius: var(--radius-xs);
    padding: 9px 16px; font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: inherit;
    display: flex; align-items: center; gap: 5px;
    box-shadow: 0 2px 8px rgba(46,125,50,0.28);
    text-decoration: none;
  }

  /* ── FARE BOX ────────────────────────────────── */
  .fare-box {
    background: var(--saffron-pale); border: 2px solid var(--saffron);
    border-radius: var(--radius-sm); padding: 14px 16px;
    font-size: 15px; font-weight: 700; color: var(--saffron-dark);
    display: flex; align-items: center; gap: 8px;
  }

  /* ── BOOKING CARD ────────────────────────────── */
  .booking-card {
    background: white; border: 2px solid var(--border);
    border-radius: var(--radius); padding: 16px; margin-bottom: 12px;
  }
  .bk-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .bk-id { font-size: 11px; color: var(--text-soft); font-weight: 700; letter-spacing: 0.5px; }
  .bk-route { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
  .bk-point { display: flex; align-items: center; gap: 10px; font-size: 14px; }
  .bk-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .bk-dot-up { background: var(--green-light); }
  .bk-dot-dn { background: var(--saffron); }
  .bk-line { width: 2px; height: 14px; background: var(--border); margin-left: 3px; }
  .bk-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .bk-chip {
    font-size: 12px; color: var(--text-soft); background: var(--bg);
    padding: 4px 10px; border-radius: 20px; font-weight: 500;
  }

  /* ── BADGE ───────────────────────────────────── */
  .badge { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
  .badge-pending    { background: #FFF8E1; color: #E65100; }
  .badge-confirmed  { background: var(--blue-pale); color: var(--blue); }
  .badge-in_progress { background: #F3E5F5; color: #6A1B9A; }
  .badge-completed  { background: var(--green-pale); color: var(--green); }
  .badge-cancelled  { background: var(--red-pale); color: var(--red); }
  .badge-online     { background: var(--green-pale); color: var(--green); }
  .badge-offline    { background: var(--red-pale); color: var(--red); }

  /* ── TOGGLE ──────────────────────────────────── */
  .toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    background: white; border: 2px solid var(--border);
    border-radius: var(--radius); padding: 16px 18px;
  }
  .toggle-label { font-size: 16px; font-weight: 700; }
  .toggle-sub   { font-size: 12px; color: var(--text-soft); margin-top: 3px; font-weight: 500; }
  .toggle-switch { position: relative; display: inline-block; width: 52px; height: 28px; flex-shrink: 0; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-thumb {
    position: absolute; cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background: #CCC; border-radius: 34px;
    transition: 0.3s;
  }
  .toggle-thumb:before {
    content: ''; position: absolute;
    height: 22px; width: 22px; left: 3px; bottom: 3px;
    background: white; border-radius: 50%;
    transition: 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }
  input:checked + .toggle-thumb { background: var(--green-light); }
  input:checked + .toggle-thumb:before { transform: translateX(24px); }

  /* ── STATS ───────────────────────────────────── */
  .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 18px 16px; }
  .stat-card { background: white; border: 2px solid var(--border); border-radius: var(--radius); padding: 16px; text-align: center; }
  .stat-num   { font-size: 30px; font-weight: 800; color: var(--saffron); }
  .stat-label { font-size: 12px; color: var(--text-soft); font-weight: 600; margin-top: 2px; }

  /* ── DRIVER LIST (admin) ─────────────────────── */
  .driver-item { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--border); }
  .driver-avatar { width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0; background: linear-gradient(135deg, var(--saffron-light), var(--saffron)); display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .driver-name { font-size: 15px; font-weight: 700; }
  .driver-meta { font-size: 12px; color: var(--text-soft); margin-top: 2px; }

  /* ── SUCCESS SCREEN ──────────────────────────── */
  .success-screen { padding: 40px 24px; text-align: center; }
  .success-emoji { font-size: 80px; animation: pop 0.4s ease; }
  @keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  .success-title { margin-top: 20px; font-size: 24px; font-weight: 800; color: var(--green); }
  .success-text  { margin-top: 10px; color: var(--text-soft); font-size: 14px; line-height: 1.6; }

  /* ── TOAST ───────────────────────────────────── */
  .toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    padding: 13px 22px; border-radius: 28px; font-size: 14px; font-weight: 700;
    z-index: 9999; animation: slideUp 0.3s ease;
    white-space: nowrap; max-width: 88vw; text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  .toast-success { background: var(--green); color: white; }
  .toast-error   { background: var(--red); color: white; }
  .toast-info    { background: var(--blue); color: white; }
  @keyframes slideUp {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* ── LOADING ─────────────────────────────────── */
  .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 56px 20px; gap: 16px; color: var(--text-soft); }
  .spinner { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: var(--saffron); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── EMPTY ───────────────────────────────────── */
  .empty { text-align: center; padding: 44px 20px; color: var(--text-soft); }
  .empty-icon { font-size: 52px; margin-bottom: 12px; }
  .empty-text { font-size: 15px; font-weight: 600; }
  .empty-sub  { font-size: 13px; margin-top: 6px; }

  /* ── DIVIDER ─────────────────────────────────── */
  .divider { height: 8px; background: var(--bg); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 16px 0; }

  /* ── DRIVER PROFILE CARD ─────────────────────── */
  .driver-profile {
    background: linear-gradient(135deg, var(--green-pale), #C8E6C9);
    border: 2px solid #A5D6A7; border-radius: var(--radius); padding: 20px; margin: 16px 18px 0;
  }
  .dp-top { display: flex; align-items: center; gap: 14px; }
  .dp-avatar { width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, var(--saffron-light), var(--saffron)); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
  .dp-name   { font-size: 18px; font-weight: 800; }
  .dp-meta   { font-size: 13px; color: var(--text-soft); margin-top: 3px; }
  .dp-stats  { display: flex; gap: 10px; margin-top: 14px; }
  .dp-stat   { flex: 1; background: white; border-radius: 10px; padding: 10px 8px; text-align: center; }
  .dp-stat-num   { font-size: 22px; font-weight: 800; color: var(--saffron); }
  .dp-stat-label { font-size: 11px; color: var(--text-soft); font-weight: 600; margin-top: 1px; }

  /* ── MISC ────────────────────────────────────── */
  .location-bar {
    background: var(--bg); border: 1px solid var(--border);
    margin: 14px 18px 0; border-radius: var(--radius-sm);
    padding: 11px 14px; display: flex; align-items: center; gap: 10px;
    font-size: 13px; color: var(--text-soft); font-weight: 500;
  }
  .page-pad { height: 40px; }
  .pad-h { padding: 0 18px; }
  .mt12 { margin-top: 12px; }
  .mt16 { margin-top: 16px; }
  .mt20 { margin-top: 20px; }
  .row-btns { display: flex; gap: 10px; }
  .row-btns .btn { flex: 1; }
  
  /* Filter pills */
  .filter-pills { display: flex; gap: 8px; padding: 12px 18px 4px; overflow-x: auto; }
  .filter-pills::-webkit-scrollbar { display: none; }
  .pill {
    flex-shrink: 0; padding: 7px 16px; border-radius: 20px; border: 2px solid var(--border);
    background: white; color: var(--text-soft); font-weight: 600; font-size: 12px;
    cursor: pointer; font-family: inherit; transition: all 0.15s;
  }
  .pill.active { border-color: var(--saffron); background: var(--saffron-pale); color: var(--saffron-dark); }

  /* Admin assign driver */
  .assign-select { font-size: 13px; padding: 8px 12px; border: 2px solid var(--border); border-radius: var(--radius-xs); font-family: inherit; color: var(--text); background: white; cursor: pointer; }

  /* ── AI CHATBOT ──────────────────────────────── */
  .ai-fab {
    position: fixed; bottom: 24px; right: 20px; z-index: 9990;
    width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
    background: linear-gradient(135deg, var(--saffron), var(--saffron-dark));
    font-size: 26px; box-shadow: 0 6px 24px rgba(255,107,26,0.5);
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .ai-fab:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(255,107,26,0.6); }
  .ai-fab:active { transform: scale(0.95); }
  .ai-fab-label {
    position: absolute; top: -2px; right: -2px;
    background: var(--green-light); color: white; font-size: 8px; font-weight: 800;
    border-radius: 10px; padding: 2px 5px; border: 2px solid white; letter-spacing: 0.3px;
  }
  .ai-window {
    position: fixed; bottom: 96px; right: 16px; z-index: 9989;
    width: 340px; max-width: calc(100vw - 32px);
    background: white; border-radius: 22px;
    box-shadow: 0 16px 56px rgba(0,0,0,0.2), 0 2px 8px rgba(255,107,26,0.1);
    display: flex; flex-direction: column; overflow: hidden;
    transform: scale(0.88) translateY(24px); opacity: 0; pointer-events: none;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    max-height: calc(100vh - 120px);
  }
  .ai-window.ai-open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
  .ai-header {
    background: linear-gradient(135deg, var(--saffron), var(--saffron-dark));
    padding: 13px 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
  }
  .ai-avatar {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    background: rgba(255,255,255,0.22); border: 2px solid rgba(255,255,255,0.4);
    display: flex; align-items: center; justify-content: center; font-size: 18px;
  }
  .ai-hname { color: white; font-size: 14px; font-weight: 800; }
  .ai-hstatus { color: rgba(255,255,255,0.85); font-size: 10px; display: flex; align-items: center; gap: 4px; }
  .ai-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green-light); flex-shrink: 0; animation: aiDotBlink 2s infinite; }
  @keyframes aiDotBlink { 0%,100%{opacity:1}50%{opacity:0.35} }
  .ai-close-btn {
    margin-left: auto; background: rgba(255,255,255,0.18); border: none; color: white;
    width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 14px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ai-lang-row {
    display: flex; background: var(--saffron-pale); border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .ai-lang-btn {
    flex: 1; padding: 7px 4px; border: none; background: transparent; cursor: pointer;
    font-family: inherit; font-size: 10px; font-weight: 700; color: var(--text-soft);
    border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s;
  }
  .ai-lang-btn.ai-lang-active { color: var(--saffron); border-bottom-color: var(--saffron); background: white; }
  .ai-messages {
    flex: 1; overflow-y: auto; padding: 12px 10px; display: flex; flex-direction: column;
    gap: 8px; background: #FFF8F3; min-height: 200px; max-height: 280px; scroll-behavior: smooth;
  }
  .ai-messages::-webkit-scrollbar { width: 3px; }
  .ai-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .ai-msg { display: flex; gap: 6px; align-items: flex-end; }
  .ai-msg.ai-user { flex-direction: row-reverse; }
  .ai-bubble {
    max-width: 80%; padding: 8px 12px; border-radius: 16px; font-size: 13px; line-height: 1.5; white-space: pre-line;
  }
  .ai-msg.ai-bot .ai-bubble { background: white; color: var(--text); border: 1px solid var(--border); border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
  .ai-msg.ai-user .ai-bubble { background: linear-gradient(135deg, var(--saffron), var(--saffron-dark)); color: white; border-bottom-right-radius: 4px; }
  .ai-msg-avatar { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; font-size: 13px; display: flex; align-items: center; justify-content: center; background: var(--saffron-pale); border: 1px solid var(--border); }
  .ai-time { font-size: 10px; color: #bbb; margin-top: 2px; }
  .ai-typing { display: flex; gap: 4px; padding: 9px 12px; }
  .ai-typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #ddd; animation: aiType 1.2s ease-in-out infinite; }
  .ai-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .ai-typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes aiType { 0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1.1);opacity:1} }
  .ai-chips {
    display: flex; gap: 6px; padding: 8px 10px; overflow-x: auto; flex-wrap: nowrap;
    background: white; border-top: 1px solid #F5EDE5; flex-shrink: 0;
  }
  .ai-chips::-webkit-scrollbar { display: none; }
  .ai-chip {
    flex-shrink: 0; padding: 5px 11px; border-radius: 20px; border: 1.5px solid var(--border);
    background: var(--saffron-pale); color: var(--saffron-dark); font-size: 11px; font-weight: 600;
    cursor: pointer; white-space: nowrap; font-family: inherit; transition: all 0.15s;
  }
  .ai-chip:hover { background: var(--saffron); color: white; border-color: var(--saffron); }
  .ai-chip:active { transform: scale(0.95); }
  .ai-input-row {
    display: flex; gap: 7px; padding: 9px 10px; background: white;
    border-top: 1px solid #F5EDE5; align-items: center; flex-shrink: 0;
  }
  .ai-input {
    flex: 1; border: 1.5px solid var(--border); border-radius: 20px;
    padding: 8px 13px; font-family: inherit; font-size: 13px; outline: none;
    background: var(--bg); transition: border-color 0.15s; color: var(--text);
  }
  .ai-input:focus { border-color: var(--saffron); }
  .ai-mic-btn {
    width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer;
    background: var(--green-pale); font-size: 15px; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0; transition: all 0.15s;
  }
  .ai-mic-btn.ai-listening { background: var(--red); animation: aiMicPulse 1s ease-out infinite; }
  @keyframes aiMicPulse { 0%{box-shadow:0 0 0 0 rgba(198,40,40,0.5)}70%{box-shadow:0 0 0 12px rgba(198,40,40,0)}100%{box-shadow:0 0 0 0 rgba(198,40,40,0)} }
  .ai-send-btn {
    width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer;
    background: linear-gradient(135deg, var(--saffron), var(--saffron-dark)); color: white;
    font-size: 15px; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: transform 0.15s;
  }
  .ai-send-btn:active { transform: scale(0.9); }
`;

// ─── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

// ─── HEADER ────────────────────────────────────────────────────────────────────
function Header({ title, subtitle, onBack }) {
  return (
    <div className="header">
      <div className="header-left">
        {onBack ? (
          <button className="back-btn" onClick={onBack}>←</button>
        ) : (
          <span className="header-icon">🚛</span>
        )}
        <div>
          <div className="header-title">{title}</div>
          {subtitle && <div className="header-sub">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── HOME ───────────────────────────────────────────────────────────────────────
function HomeScreen({ onSelectRole }) {
  return (
    <div className="scroll-area">
      <div className="hero">
        <span className="hero-truck">🚛</span>
        <h1>गाड़ी एक्सप्रेस</h1>
        <p>ग्रामीण परिवहन — अब आपकी पहुँच में</p>
        <div className="hero-badge">🌾 UP Rural Transport Network</div>
      </div>
      <div className="role-section">
        <div className="role-card rc-customer" onClick={() => onSelectRole('customer')}>
          <span className="role-emoji">👤</span>
          <div className="role-info">
            <h3>ग्राहक हूँ</h3>
            <p>गाड़ी बुक करें • नज़दीकी वाहन देखें</p>
          </div>
        </div>
        <div className="role-card rc-driver" onClick={() => onSelectRole('driver')}>
          <span className="role-emoji">🚜</span>
          <div className="role-info">
            <h3>वाहन मालिक हूँ</h3>
            <p>रजिस्टर करें • बुकिंग पाएं • कमाई करें</p>
          </div>
        </div>
        <div className="role-card rc-admin" onClick={() => onSelectRole('admin')}>
          <span className="role-emoji">⚙️</span>
          <div className="role-info">
            <h3>Admin Panel</h3>
            <p>सभी बुकिंग • ड्राइवर प्रबंधन • Stats</p>
          </div>
        </div>
      </div>
      <div className="page-pad" />
    </div>
  );
}

// ─── BOOKING CARD ───────────────────────────────────────────────────────────────
function BookingCard({ booking, onUpdateStatus, showAdmin, drivers }) {
  const [assignId, setAssignId] = useState('');
  const STATUS_LABEL = {
    pending: '⏳ Pending', confirmed: '✅ Confirmed',
    in_progress: '🚛 On Way', completed: '🏁 Completed', cancelled: '❌ Cancelled'
  };
  return (
    <div className="booking-card">
      <div className="bk-header">
        <span className="bk-id">#{booking.id.slice(-6).toUpperCase()}</span>
        <span className={`badge badge-${booking.status}`}>{STATUS_LABEL[booking.status] || booking.status}</span>
      </div>
      <div className="bk-route">
        <div className="bk-point"><span className="bk-dot bk-dot-up" /><span>{booking.pickupAddress}</span></div>
        <div style={{ paddingLeft: 3 }}><div className="bk-line" /></div>
        <div className="bk-point"><span className="bk-dot bk-dot-dn" /><span>{booking.dropAddress}</span></div>
      </div>
      <div className="bk-meta">
        <span className="bk-chip">📦 {booking.goodsType}</span>
        <span className="bk-chip">👤 {booking.customerName}</span>
        {booking.driverName && <span className="bk-chip">🚛 {booking.driverName}</span>}
        {booking.fare && <span className="bk-chip">💰 ₹{booking.fare}</span>}
        <span className="bk-chip">📞 {booking.customerPhone}</span>
      </div>
      {showAdmin && onUpdateStatus && booking.status !== 'completed' && booking.status !== 'cancelled' && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {booking.status === 'pending' && !booking.driverId && drivers && drivers.length > 0 && (
            <>
              <select className="assign-select" value={assignId} onChange={e => setAssignId(e.target.value)}>
                <option value="">Driver चुनें</option>
                {drivers.filter(d => d.available).map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.vehicleType})</option>
                ))}
              </select>
              {assignId && (
                <button className="btn btn-sm btn-green" onClick={() => { onUpdateStatus(booking.id, 'confirmed', assignId); setAssignId(''); }}>
                  ✅ Assign
                </button>
              )}
            </>
          )}
          {booking.status === 'pending' && (
            <button className="btn btn-sm btn-blue" onClick={() => onUpdateStatus(booking.id, 'confirmed')}>✅ Confirm</button>
          )}
          {booking.status === 'confirmed' && (
            <button className="btn btn-sm btn-blue" onClick={() => onUpdateStatus(booking.id, 'in_progress')}>🚛 Start Trip</button>
          )}
          {booking.status === 'in_progress' && (
            <button className="btn btn-sm btn-green" onClick={() => onUpdateStatus(booking.id, 'completed')}>🏁 Complete</button>
          )}
          <button className="btn btn-sm btn-red" onClick={() => onUpdateStatus(booking.id, 'cancelled')}>❌</button>
        </div>
      )}
    </div>
  );
}

// ─── CUSTOMER ───────────────────────────────────────────────────────────────────
function CustomerScreen({ showToast, onBack }) {
  const [tab, setTab] = useState('book');
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', pickupAddress: '', dropAddress: '' });
  const [selectedGoods, setSelectedGoods] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookPhone, setBookPhone] = useState('');
  const [lastBooking, setLastBooking] = useState(null);

  const getGPS = async () => {
    setLocLoading(true);
    try {
      const pos = await getLocation();
      setLocation(pos);
      if (pos.isFallback) {
        showToast('📍 Demo location: Lucknow', 'info');
      } else {
        showToast('📍 Location मिल गई!');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLocLoading(false);
  };

  const searchVehicles = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.pickupAddress.trim() || !form.dropAddress.trim()) {
      showToast('सभी जानकारी भरें', 'error'); return;
    }
    if (form.phone.length < 10) { showToast('सही मोबाइल नंबर डालें', 'error'); return; }
    if (!selectedGoods) { showToast('सामान का प्रकार चुनें', 'error'); return; }
    if (!location) { showToast('पहले location लें', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.getNearbyVehicles(location.lat, location.lng, 50);
      setVehicles(res.vehicles || []);
      setStep(2);
      if ((res.vehicles || []).length === 0) showToast('कोई गाड़ी नहीं मिली, Admin assign करेगा', 'info');
    } catch (err) { showToast(err.message, 'error'); }
    setLoading(false);
  };

  const bookVehicle = async (withoutDriver = false) => {
    setLoading(true);
    try {
      const vehicle = withoutDriver ? null : selectedVehicle;
      const res = await api.createBooking({
        customerName: form.name,
        customerPhone: form.phone,
        pickupAddress: form.pickupAddress,
        dropAddress: form.dropAddress,
        pickupLat: location?.lat,
        pickupLng: location?.lng,
        goodsType: selectedGoods,
        driverId: vehicle?.id || null,
        fare: vehicle ? calcFare(vehicle.distance) : null
      });
      setLastBooking(res.booking);
      showToast('✅ बुकिंग हो गई!');
      setStep(3);
    } catch (err) { showToast(err.message, 'error'); }
    setLoading(false);
  };

  const loadMyBookings = async () => {
    if (!bookPhone || bookPhone.length < 10) { showToast('10 अंकों का नंबर डालें', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.getBookings();
      const filtered = res.bookings.filter(b => b.customerPhone === bookPhone);
      setBookings(filtered);
      if (filtered.length === 0) showToast('कोई बुकिंग नहीं मिली', 'info');
    } catch (err) { showToast(err.message, 'error'); }
    setLoading(false);
  };

  const resetBook = () => {
    setStep(1); setForm({ name: '', phone: '', pickupAddress: '', dropAddress: '' });
    setSelectedGoods(null); setSelectedVehicle(null); setVehicles([]); setLastBooking(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="ग्राहक" subtitle="Booking Panel" onBack={onBack} />
      <div className="tabs">
        <div className={`tab ${tab === 'book' ? 'active' : ''}`} onClick={() => { setTab('book'); }}>🚛 बुकिंग करें</div>
        <div className={`tab ${tab === 'mybookings' ? 'active' : ''}`} onClick={() => setTab('mybookings')}>📋 मेरी बुकिंग</div>
      </div>
      <div className="scroll-area">
        {tab === 'book' && (
          <>
            {step === 1 && (
              <>
                <div className="section mt16">
                  <div className="section-title">📍 आपकी Location</div>
                  <button className="gps-btn" onClick={getGPS} disabled={locLoading}>
                    <span className="gps-pulse" />
                    <span>
                      {locLoading ? '⏳ GPS ढूंढ रहे हैं...' :
                        location ? `✅ Location मिली (${location.lat.toFixed(3)}, ${location.lng.toFixed(3)})` :
                          'GPS से Location लें'}
                    </span>
                  </button>
                </div>

                <div className="section mt16">
                  <div className="section-title">👤 आपकी जानकारी</div>
                  <div className="form-group">
                    <label className="form-label">आपका नाम</label>
                    <input className="form-input" placeholder="पूरा नाम लिखें" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">मोबाइल नंबर</label>
                    <input className="form-input" type="tel" inputMode="numeric" placeholder="10 अंकों का नंबर" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} maxLength={10} />
                  </div>
                </div>

                <div className="section mt8">
                  <div className="section-title">🗺️ रूट जानकारी</div>
                  <div className="form-group">
                    <label className="form-label">🟢 कहाँ से (Pickup)</label>
                    <input className="form-input" placeholder="गाँव, तहसील, जिला" value={form.pickupAddress} onChange={e => setForm({ ...form, pickupAddress: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">🔴 कहाँ तक (Drop)</label>
                    <input className="form-input" placeholder="मंडी, शहर, स्थान" value={form.dropAddress} onChange={e => setForm({ ...form, dropAddress: e.target.value })} />
                  </div>
                </div>

                <div className="section mt8">
                  <div className="section-title">📦 सामान का प्रकार चुनें</div>
                  <div className="goods-grid">
                    {GOODS_TYPES.map(g => (
                      <button key={g.value} className={`goods-btn ${selectedGoods === g.value ? 'selected' : ''}`} onClick={() => setSelectedGoods(g.value)}>
                        <span className="goods-btn-emoji">{g.label.split(' ')[0]}</span>
                        <span className="goods-btn-label">{g.label.split(' ').slice(1).join(' ')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pad-h mt20">
                  <button className="btn btn-saffron" onClick={searchVehicles} disabled={loading}>
                    {loading ? '⏳ खोज रहे हैं...' : '🔍 नज़दीकी गाड़ियाँ देखें'}
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="location-bar">
                  <span className="gps-pulse" />
                  <span>50km के अंदर <strong>{vehicles.length}</strong> गाड़ियाँ उपलब्ध</span>
                </div>
                {vehicles.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">🔍</div>
                    <div className="empty-text">अभी कोई गाड़ी नहीं मिली</div>
                    <div className="empty-sub">Admin आपको गाड़ी assign करेंगे</div>
                  </div>
                ) : (
                  <div className="vehicle-list">
                    {vehicles.map(v => (
                      <div key={v.id} className={`vehicle-card ${selectedVehicle?.id === v.id ? 'selected' : ''}`} onClick={() => setSelectedVehicle(v)}>
                        <div className="vc-top">
                          <div style={{ display: 'flex', gap: 12 }}>
                            <div className="vc-avatar">{VEHICLE_EMOJI[v.vehicleType] || '🚛'}</div>
                            <div>
                              <div className="vc-name">{v.name}</div>
                              <div className="vc-type">{v.vehicleType} • {v.vehicleNumber}</div>
                              <div className="vc-dist">📍 {v.distance} km • {v.city}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div className="vc-rating">⭐ {v.rating || 'नया'}</div>
                            <div className="vc-trips">{v.trips} trips</div>
                            {selectedVehicle?.id === v.id && (
                              <div style={{ fontSize: 12, color: 'var(--saffron)', fontWeight: 700, marginTop: 4 }}>✓ चुना</div>
                            )}
                          </div>
                        </div>
                        <div className="vc-bottom">
                          <a href={`tel:${v.phone}`} style={{ textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                            <button className="call-btn">📞 Call</button>
                          </a>
                          {selectedVehicle?.id === v.id && (
                            <div className="fare-box" style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}>
                              💰 अनुमानित: ₹{calcFare(v.distance)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pad-h" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 16 }}>
                  {selectedVehicle && (
                    <div className="fare-box">
                      💰 अनुमानित किराया: ₹{calcFare(selectedVehicle.distance)} ({selectedVehicle.distance} km)
                    </div>
                  )}
                  <button className="btn btn-saffron" onClick={() => bookVehicle(false)} disabled={loading || !selectedVehicle}>
                    {loading ? '⏳ बुक हो रहा है...' : '✅ चुनी गाड़ी बुक करें'}
                  </button>
                  <button className="btn btn-outline" onClick={() => bookVehicle(true)} disabled={loading}>
                    📋 Admin से assign करवाएं
                  </button>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← वापस जाएं</button>
                </div>
              </>
            )}

            {step === 3 && lastBooking && (
              <div className="success-screen">
                <div className="success-emoji">🎉</div>
                <div className="success-title">बुकिंग हो गई!</div>
                <div className="success-text">
                  Booking ID: <strong>#{lastBooking.id.slice(-6).toUpperCase()}</strong><br />
                  Status: <strong>{lastBooking.status === 'confirmed' ? '✅ Confirmed' : '⏳ Pending (Admin assign करेगा)'}</strong>
                  {lastBooking.driverName && <><br />Driver: <strong>{lastBooking.driverName}</strong></>}
                  {lastBooking.fare && <><br />किराया: <strong>₹{lastBooking.fare}</strong></>}
                </div>
                <div className="mt20">
                  <button className="btn btn-saffron" onClick={resetBook}>नई बुकिंग करें</button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'mybookings' && (
          <div>
            <div className="section mt16">
              <div className="section-title">📱 अपनी बुकिंग देखें</div>
              <div className="form-group">
                <label className="form-label">रजिस्टर्ड मोबाइल नंबर</label>
                <input className="form-input" type="tel" inputMode="numeric" placeholder="10 अंकों का नंबर" value={bookPhone} onChange={e => setBookPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} onKeyDown={e => e.key === 'Enter' && loadMyBookings()} />
              </div>
              <button className="btn btn-saffron" onClick={loadMyBookings} disabled={loading}>
                {loading ? '⏳ खोज रहे हैं...' : '🔍 बुकिंग देखें'}
              </button>
            </div>
            <div style={{ padding: '16px 18px 0' }}>
              {bookings.length > 0 && bookings.map(b => <BookingCard key={b.id} booking={b} />)}
              {bookings.length === 0 && bookPhone && !loading && (
                <div className="empty mt20">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">कोई बुकिंग नहीं मिली</div>
                  <div className="empty-sub">नंबर चेक करें</div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="page-pad" />
      </div>
    </div>
  );
}

// ─── DRIVER ─────────────────────────────────────────────────────────────────────
function DriverScreen({ showToast, onBack }) {
  const [tab, setTab] = useState('register');
  const [driver, setDriver] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', vehicleType: 'Tractor', vehicleNumber: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [location, setLocation] = useState(null);

  const register = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.city.trim()) {
      showToast('नाम, मोबाइल और शहर जरूरी है', 'error'); return;
    }
    if (form.phone.length < 10) { showToast('सही मोबाइल नंबर डालें', 'error'); return; }
    setLoading(true);
    try {
      const pos = await getLocation();
      setLocation(pos);
      const res = await api.registerDriver({ ...form, lat: pos.lat, lng: pos.lng });
      setDriver(res.driver);
      showToast('✅ रजिस्ट्रेशन हो गया!');
    } catch (err) { showToast(err.message, 'error'); }
    setLoading(false);
  };

  const login = async () => {
    if (!form.phone || form.phone.length < 10) { showToast('सही नंबर डालें', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.getDrivers();
      const found = res.drivers.find(d => d.phone === form.phone);
      if (!found) { showToast('यह नंबर रजिस्टर नहीं है', 'error'); setLoading(false); return; }
      setDriver(found);
      const bRes = await api.getBookings({ driverId: found.id });
      setBookings(bRes.bookings || []);
      showToast('✅ Login हो गए!');
    } catch (err) { showToast(err.message, 'error'); }
    setLoading(false);
  };

  const toggleAvail = async () => {
    if (!driver) return;
    setLoading(true);
    try {
      let pos = location;
      try { pos = await getLocation(); setLocation(pos); } catch {}
      const res = await api.toggleAvailability(driver.id, !driver.available, pos?.lat, pos?.lng);
      setDriver(res.driver);
      showToast(res.driver.available ? '🟢 Online हो गए!' : '🔴 Offline हो गए');
    } catch (err) { showToast(err.message, 'error'); }
    setLoading(false);
  };

  const complete = async (id) => {
    try {
      await api.updateBookingStatus(id, 'completed');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b));
      setDriver(prev => prev ? { ...prev, trips: prev.trips + 1, available: true } : prev);
      showToast('🏁 Trip पूरा हुआ!');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const refreshBookings = async () => {
    if (!driver) return;
    try {
      const res = await api.getBookings({ driverId: driver.id });
      setBookings(res.bookings || []);
    } catch {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="वाहन मालिक" subtitle="Driver Dashboard" onBack={onBack} />
      {!driver ? (
        <>
          <div className="tabs">
            <div className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>📝 रजिस्टर करें</div>
            <div className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>🔑 Login</div>
          </div>
          <div className="scroll-area">
            <div className="section mt20">
              {tab === 'register' && (
                <>
                  <div className="form-group"><label className="form-label">पूरा नाम</label><input className="form-input" placeholder="आपका नाम" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">मोबाइल नंबर</label><input className="form-input" type="tel" inputMode="numeric" placeholder="10 अंक" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} maxLength={10} /></div>
                  <div className="form-group">
                    <label className="form-label">वाहन का प्रकार</label>
                    <select className="form-input form-select" value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
                      {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">वाहन नंबर (Optional)</label><input className="form-input" placeholder="UP32 AB 1234" value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">शहर / जिला</label><input className="form-input" placeholder="जैसे: Sitapur, Lucknow" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                  <button className="btn btn-green" onClick={register} disabled={loading}>{loading ? '⏳ रजिस्टर हो रहा है...' : '✅ रजिस्टर करें'}</button>
                </>
              )}
              {tab === 'login' && (
                <>
                  <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 20 }}>🔑</div>
                  <div className="form-group"><label className="form-label">रजिस्टर्ड मोबाइल नंबर</label><input className="form-input" type="tel" inputMode="numeric" placeholder="10 अंक" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} maxLength={10} onKeyDown={e => e.key === 'Enter' && login()} /></div>
                  <button className="btn btn-green" onClick={login} disabled={loading}>{loading ? '⏳ Login...' : '🔑 Login करें'}</button>
                  <p style={{ marginTop: 12, fontSize: 12, color: '#aaa', textAlign: 'center' }}>
                    Demo numbers: 9876543210, 9812345678, 9845678901
                  </p>
                </>
              )}
            </div>
            <div className="page-pad" />
          </div>
        </>
      ) : (
        <div className="scroll-area">
          {/* Profile Card */}
          <div className="driver-profile">
            <div className="dp-top">
              <div className="dp-avatar">{VEHICLE_EMOJI[driver.vehicleType] || '🚛'}</div>
              <div>
                <div className="dp-name">{driver.name}</div>
                <div className="dp-meta">{driver.vehicleType} • {driver.vehicleNumber}</div>
                <div className="dp-meta">📍 {driver.city} • 📞 {driver.phone}</div>
              </div>
            </div>
            <div className="dp-stats">
              <div className="dp-stat"><div className="dp-stat-num">{driver.trips}</div><div className="dp-stat-label">Trips</div></div>
              <div className="dp-stat"><div className="dp-stat-num" style={{ color: '#F57F17' }}>⭐{driver.rating || '-'}</div><div className="dp-stat-label">Rating</div></div>
              <div className="dp-stat"><div className="dp-stat-num" style={{ fontSize: 16, color: driver.available ? 'var(--green)' : 'var(--red)' }}>{driver.available ? '🟢' : '🔴'}</div><div className="dp-stat-label">Status</div></div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div style={{ padding: '14px 18px 0' }}>
            <div className="toggle-row">
              <div>
                <div className="toggle-label">{driver.available ? '🟢 Online हूँ' : '🔴 Offline हूँ'}</div>
                <div className="toggle-sub">{driver.available ? 'बुकिंग मिल सकती है' : 'बुकिंग नहीं आएगी'}</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={driver.available} onChange={toggleAvail} disabled={loading} />
                <span className="toggle-thumb" />
              </label>
            </div>
          </div>

          <div className="divider" />

          {/* Bookings */}
          <div style={{ padding: '0 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="section-title" style={{ margin: 0 }}>📋 मेरी बुकिंग ({bookings.length})</div>
              <button onClick={refreshBookings} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>🔄</button>
            </div>
            {bookings.length === 0 ? (
              <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">अभी कोई बुकिंग नहीं</div><div className="empty-sub">Online होने पर बुकिंग मिलेगी</div></div>
            ) : bookings.map(b => (
              <div key={b.id}>
                <BookingCard booking={b} />
                {(b.status === 'confirmed' || b.status === 'in_progress') && (
                  <div style={{ marginTop: -8, marginBottom: 12 }}>
                    <button className="btn btn-green" onClick={() => complete(b.id)}>🏁 Trip पूरा हुआ</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="page-pad" />
        </div>
      )}
    </div>
  );
}

// ─── ADMIN ──────────────────────────────────────────────────────────────────────
function AdminScreen({ showToast, onBack }) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const loginAdmin = () => {
    if (pass === 'admin123') { setAuthed(true); loadAll(); }
    else showToast('गलत Password!', 'error');
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, d, b] = await Promise.all([api.getStats(), api.getDrivers(), api.getBookings()]);
      setStats(s); setDrivers(d.drivers); setBookings(b.bookings);
    } catch (err) { showToast(err.message, 'error'); }
    setLoading(false);
  };

  const updateStatus = async (id, status, driverId) => {
    try {
      await api.updateBookingStatus(id, status, driverId);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status, driverId: driverId || b.driverId } : b));
      showToast('✅ Status update हुआ!');
      loadAll();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const filtered = filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus);

  if (!authed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Header title="Admin Panel" onBack={onBack} />
        <div style={{ padding: '48px 24px' }}>
          <div style={{ fontSize: 56, textAlign: 'center', marginBottom: 24 }}>🔐</div>
          <div className="form-group"><label className="form-label">Admin Password</label><input className="form-input" type="password" placeholder="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && loginAdmin()} /></div>
          <button className="btn btn-saffron" onClick={loginAdmin}>🔑 Login</button>
          <p style={{ marginTop: 12, fontSize: 12, color: '#aaa', textAlign: 'center' }}>Demo: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Admin Panel" subtitle="गाड़ी एक्सप्रेस" onBack={onBack} />
      <div className="tabs" style={{ fontSize: 12 }}>
        <div className={`tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>📊 Stats</div>
        <div className={`tab ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>📋 Bookings</div>
        <div className={`tab ${tab === 'drivers' ? 'active' : ''}`} onClick={() => setTab('drivers')}>🚛 Drivers</div>
      </div>
      <div className="scroll-area">
        {loading && <div className="loading"><div className="spinner" /><span>Loading...</span></div>}

        {!loading && tab === 'stats' && stats && (
          <>
            <div style={{ padding: '16px 18px 8px' }}><div className="section-title">📊 Overview</div></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-num">{stats.bookings.total}</div><div className="stat-label">कुल बुकिंग</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color: 'var(--yellow)' }}>{stats.bookings.pending}</div><div className="stat-label">Pending</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color: 'var(--green)' }}>{stats.bookings.completed}</div><div className="stat-label">Completed</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color: 'var(--blue)' }}>{stats.drivers.available}/{stats.drivers.total}</div><div className="stat-label">Drivers Online</div></div>
              <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                <div className="stat-num" style={{ color: 'var(--green)' }}>₹{stats.revenue.commission}</div>
                <div className="stat-label">Commission (10% of ₹{stats.revenue.totalFare})</div>
              </div>
            </div>
            <div className="pad-h"><button className="btn btn-outline" onClick={loadAll}>🔄 Refresh</button></div>
          </>
        )}

        {!loading && tab === 'bookings' && (
          <>
            <div className="filter-pills">
              {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => (
                <button key={s} className={`pill ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
                  {s === 'all' ? 'सभी' : s === 'in_progress' ? 'On Way' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ padding: '8px 18px 0' }}>
              {filtered.length === 0
                ? <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">कोई बुकिंग नहीं</div></div>
                : filtered.map(b => <BookingCard key={b.id} booking={b} onUpdateStatus={updateStatus} showAdmin drivers={drivers} />)
              }
            </div>
          </>
        )}

        {!loading && tab === 'drivers' && (
          <>
            <div style={{ padding: '16px 18px 8px' }}>
              <div className="section-title">{drivers.filter(d => d.available).length} Online / {drivers.length} Total</div>
            </div>
            {drivers.map(d => (
              <div key={d.id} className="driver-item">
                <div className="driver-avatar">{VEHICLE_EMOJI[d.vehicleType] || '🚛'}</div>
                <div style={{ flex: 1 }}>
                  <div className="driver-name">{d.name}</div>
                  <div className="driver-meta">{d.vehicleType} • {d.city}</div>
                  <div className="driver-meta">📞 {d.phone} • ⭐ {d.rating || 'New'} • {d.trips} trips</div>
                </div>
                <span className={`badge ${d.available ? 'badge-online' : 'badge-offline'}`}>
                  {d.available ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
            ))}
          </>
        )}
        <div className="page-pad" />
      </div>
    </div>
  );
}

// ─── AI CHATBOT ─────────────────────────────────────────────────────────────────
const AI_RESPONSES = {
  hi: {
    greet: 'नमस्ते! 🙏 मैं गाड़ी Express AI हूँ।\nमैं इन कामों में मदद करता हूँ:\n🚛 गाड़ी बुकिंग\n🔍 नज़दीकी वाहन\n💰 किराया जानना\n📋 बुकिंग status\n\nआप क्या जानना चाहते हैं?',
    book: '🚛 बुकिंग शुरू करते हैं!\nपहले अपना पूरा नाम बताएं।',
    askFrom: 'ठीक है! अब बताएं — सामान कहाँ से उठाना है?\n(गाँव / तहसील / जिला)',
    askTo: 'समझ गया! अब बताएं — सामान कहाँ पहुँचाना है?\n(मंडी / शहर / स्थान)',
    askGoods: 'रास्ता नोट हो गया! अब बताएं —\nक्या सामान है?\n(जैसे: अनाज, फर्नीचर, गल्ला, मशीनरी)',
    fareCalc: (name, from, to, goods) =>
      `✅ बुकिंग Details:\n👤 ${name}\n📍 ${from} → ${to}\n📦 ${goods}\n💰 अनुमानित किराया: ₹${(Math.floor(Math.random()*15)+5)*100}–₹${(Math.floor(Math.random()*20)+20)*100}\n\nक्या बुकिंग Confirm करूँ? (हाँ / नहीं)`,
    confirmed: (id) => `🎉 बुकिंग हो गई!\nBooking ID: #${id}\n\nड्राइवर 30 मिनट में contact करेगा। धन्यवाद! 🙏`,
    vehicles: '🔍 नज़दीकी वाहन खोज रहे हैं...\n\n✅ 3 वाहन उपलब्ध:\n🚛 रमेश ट्रकिंग — 2.3 km — ⭐4.8\n🚜 श्याम ट्रांसपोर्ट — 4.1 km — ⭐4.5\n🚚 गिरिजा कैरियर्स — 5.8 km — ⭐4.2\n\nApp में "ग्राहक हूँ" से बुकिंग करें।',
    mybooking: '📋 बुकिंग देखने के लिए App में\n"ग्राहक हूँ → मेरी बुकिंग" में जाएं\nऔर अपना मोबाइल नंबर डालें।',
    fare: 'किराया जानने के लिए बताएं —\nकहाँ से कहाँ जाना है?',
    help: '📞 मैं इनमें मदद कर सकता हूँ:\n\n🚛 गाड़ी बुक करना\n🔍 नज़दीकी वाहन खोजना\n💰 किराया जानना\n📋 बुकिंग status देखना\n🚜 Driver registration\n⚙️ Admin जानकारी',
    cancel: 'ठीक है, बुकिंग प्रक्रिया रद्द की गई।\nक्या और कुछ मदद चाहिए?',
    driver: '🚜 Driver बनने के लिए:\nApp में "वाहन मालिक हूँ" पर क्लिक करें\nऔर registration form भरें।\n\nफायदे:\n✅ रोज़ बुकिंग मिलेगी\n✅ अपनी कमाई बढ़ाएं\n✅ Online/Offline control',
    admin: '⚙️ Admin Panel के लिए:\nApp में "Admin Panel" पर जाएं।\nDemo password: admin123\n\nAdmin सभी बुकिंग manage और drivers assign कर सकते हैं।',
    unknown: 'माफ़ कीजिए, मैं समझ नहीं पाया। 🙏\nआप इनमें से कुछ पूछ सकते हैं:\n• गाड़ी बुक करो\n• नज़दीकी वाहन\n• किराया कितना होगा\n• मेरी बुकिंग दिखाओ',
  },
  en: {
    greet: 'Hello! 👋 I\'m Gaadi Express AI.\nI can help with:\n🚛 Book a vehicle\n🔍 Find nearby trucks\n💰 Check fare\n📋 Booking status\n\nHow can I help you?',
    book: '🚛 Let\'s start booking!\nFirst, please tell me your full name.',
    askFrom: 'Got it! Where should we pick up the goods?\n(Village / Tehsil / District)',
    askTo: 'Perfect! Where should the goods be delivered?\n(Mandi / City / Location)',
    askGoods: 'Route noted! Now tell me —\nWhat type of goods?\n(e.g. Grain, Furniture, Machinery)',
    fareCalc: (name, from, to, goods) =>
      `✅ Booking Summary:\n👤 ${name}\n📍 ${from} → ${to}\n📦 ${goods}\n💰 Estimated Fare: ₹${(Math.floor(Math.random()*15)+5)*100}–₹${(Math.floor(Math.random()*20)+20)*100}\n\nShall I confirm the booking? (Yes / No)`,
    confirmed: (id) => `🎉 Booking Confirmed!\nBooking ID: #${id}\n\nDriver will contact you in 30 mins. Thank you!`,
    vehicles: '🔍 Searching nearby vehicles...\n\n✅ 3 vehicles available:\n🚛 Ramesh Trucking — 2.3 km — ⭐4.8\n🚜 Shyam Transport — 4.1 km — ⭐4.5\n🚚 Girija Carriers — 5.8 km — ⭐4.2\n\nUse "Customer" in the App to book.',
    mybooking: '📋 To check bookings, go to\n"Customer → My Bookings" in the App\nand enter your mobile number.',
    fare: 'To check fare, please tell me —\nFrom where to where?',
    help: '📞 I can help with:\n\n🚛 Book a vehicle\n🔍 Find nearby trucks\n💰 Check fares\n📋 Booking status\n🚜 Driver registration\n⚙️ Admin info',
    cancel: 'Okay, booking process cancelled.\nAnything else I can help with?',
    driver: '🚜 To become a driver:\nClick "Vehicle Owner" in the App\nand fill the registration form.\n\nBenefits:\n✅ Get daily bookings\n✅ Increase your earnings\n✅ Control Online/Offline',
    admin: '⚙️ For Admin Panel:\nGo to "Admin Panel" in the App.\nDemo password: admin123',
    unknown: 'Sorry, I didn\'t understand. 🙏\nYou can ask about:\n• Book a vehicle\n• Nearby trucks\n• Fare estimate\n• My bookings',
  },
  hinglish: {
    greet: 'Hello yaar! 👋 Main hoon Gaadi Express AI.\nKya help chahiye?\n🚛 Gaadi book karna\n🔍 Nearby trucks\n💰 Fare check\n📋 Booking status',
    book: '🚛 Booking shuru karte hain!\nPehle apna naam batao.',
    askFrom: 'Theek hai! Kahan se saman uthana hai?',
    askTo: 'Samajh gaya! Kahan deliver karna hai?',
    askGoods: 'Route note ho gaya! Ab batao —\nKya saman hai?',
    fareCalc: (name, from, to, goods) =>
      `✅ Booking Detail:\n👤 ${name}\n📍 ${from} → ${to}\n📦 ${goods}\n💰 Estimated fare: ₹${(Math.floor(Math.random()*15)+5)*100}–₹${(Math.floor(Math.random()*20)+20)*100}\n\nConfirm karoon? (Haan / Nahi)`,
    confirmed: (id) => `🎉 Booking ho gayi!\nID: #${id}\n\nDriver 30 min mein call karega. Thanks! 🙏`,
    vehicles: '🔍 Nearby vehicles dhundh raha hoon...\n\n✅ 3 vehicles available:\n🚛 Ramesh Trucking — 2.3 km ⭐4.8\n🚜 Shyam Transport — 4.1 km ⭐4.5\n🚚 Girija Carriers — 5.8 km ⭐4.2',
    mybooking: '📋 Booking dekhne ke liye App mein\n"Grahak → Meri Booking" mein jao.',
    fare: 'Fare jaanne ke liye batao —\nKahan se kahan?',
    help: 'Main help kar sakta hoon:\n🚛 Gaadi book karna\n🔍 Nearby trucks\n💰 Fare check\n📋 Booking status\n🚜 Driver bano',
    cancel: 'Theek hai, cancel kar diya.\nAur kuch chahiye?',
    driver: '🚜 Driver banne ke liye:\nApp mein "Vahan Malik" click karo.',
    admin: '⚙️ Admin Panel ke liye:\nApp mein "Admin Panel" mein jao.\nPassword: admin123',
    unknown: 'Yaar, samajh nahi aaya. 😅\nIn cheezoon ke baare mein pucho:\n• Gaadi book karo\n• Nearby vehicles\n• Fare kitna\n• Meri booking',
  },
};

const AI_CHIPS = {
  hi:       ['🚛 बुकिंग करें', '🔍 नज़दीकी गाड़ी', '💰 किराया', '📋 मेरी बुकिंग', '🚜 Driver बनें', '❓ Help'],
  en:       ['🚛 Book Vehicle', '🔍 Nearby Trucks', '💰 Check Fare', '📋 My Bookings', '🚜 Become Driver', '❓ Help'],
  hinglish: ['🚛 Book Karo', '🔍 Gaadi Dhundo', '💰 Fare Kitna?', '📋 Meri Booking', '🚜 Driver Bano', '❓ Help'],
};

function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('hi');
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [convState, setConvState] = useState({});
  const msgsEndRef = React.useRef(null);
  const recognitionRef = React.useRef(null);

  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setTimeout(() => addBot(AI_RESPONSES[lang].greet), 450);
    }
  }, [open]); // eslint-disable-line

  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const addBot = useCallback((text) => {
    setTyping(true);
    const delay = Math.min(500 + text.length * 10, 2000);
    setTimeout(() => {
      setTyping(false);
      setMsgs(prev => [...prev, { role: 'bot', text, time: now() }]);
      speak(text);
    }, delay);
  }, []); // eslint-disable-line

  const addUser = (text) => setMsgs(prev => [...prev, { role: 'user', text, time: now() }]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[🎉✅🚛🔍💰📋❓🙏👋📍📦🚜⚙️🔑🌾]/g, '').trim();
    if (clean.length < 3) return;
    const utt = new SpeechSynthesisUtterance(clean.substring(0, 180));
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.lang.startsWith('hi')) || voices.find(v => v.lang.startsWith('en-IN')) || voices[0];
    if (v) utt.voice = v;
    utt.rate = 0.88; utt.pitch = 1.05; utt.volume = 0.85;
    window.speechSynthesis.speak(utt);
  };

  const genId = () => Math.random().toString(36).substr(2, 6).toUpperCase();

  const process = useCallback((raw) => {
    const t = raw.toLowerCase().trim();
    const R = AI_RESPONSES[lang];
    const cs = convState;

    if (cs.step === 'ask_name') {
      setConvState({ ...cs, name: raw, step: 'ask_from' });
      return addBot(R.askFrom);
    }
    if (cs.step === 'ask_from') {
      setConvState({ ...cs, from: raw, step: 'ask_to' });
      return addBot(R.askTo);
    }
    if (cs.step === 'ask_to') {
      setConvState({ ...cs, to: raw, step: 'ask_goods' });
      return addBot(R.askGoods);
    }
    if (cs.step === 'ask_goods') {
      const updated = { ...cs, goods: raw, step: 'confirm' };
      setConvState(updated);
      return addBot(R.fareCalc(cs.name, cs.from, cs.to, raw));
    }
    if (cs.step === 'confirm') {
      setConvState({});
      const yes = t.includes('हाँ') || t.includes('han') || t.includes('yes') || t.includes('haa') || t.includes('ok') || t.includes('ठीक') || t.includes('confirm') || t.includes('karo') || t.includes('kardo');
      return addBot(yes ? R.confirmed(genId()) : R.cancel);
    }

    if (t.includes('book') || t.includes('बुक') || t.includes('gaadi book') || t.includes('गाड़ी बुक') || t.includes('booking karo') || t.includes('बुकिंग करो')) {
      setConvState({ step: 'ask_name' });
      return addBot(R.book);
    }
    if (t.includes('नज़दीक') || t.includes('nearby') || t.includes('vehicle') || t.includes('वाहन') || t.includes('gaadi dhundo') || t.includes('गाड़ी ढूंढ') || t.includes('truck')) return addBot(R.vehicles);
    if (t.includes('मेरी बुकिंग') || t.includes('my booking') || t.includes('meri booking') || t.includes('status') || t.includes('booking check')) return addBot(R.mybooking);
    if (t.includes('किराया') || t.includes('fare') || t.includes('kitna') || t.includes('rate') || t.includes('cost') || t.includes('price')) return addBot(R.fare);
    if (t.includes('driver') || t.includes('ड्राइवर') || t.includes('vahan malik') || t.includes('वाहन मालिक') || t.includes('register')) return addBot(R.driver);
    if (t.includes('admin') || t.includes('password') || t.includes('panel')) return addBot(R.admin);
    if (t.includes('help') || t.includes('मदद') || t.includes('kya kar') || t.includes('क्या कर')) return addBot(R.help);
    if (t.includes('cancel') || t.includes('रद्द') || t.includes('band') || t.includes('nahi')) return addBot(R.cancel);
    if (t.match(/^(नमस्ते|hello|hi|helo|namaste|hey|हेलो)[\s!]*$/)) return addBot(R.greet);

    return addBot(R.unknown);
  }, [lang, convState, addBot]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    addUser(text);
    process(text);
  };

  const handleChip = (chip) => {
    addUser(chip);
    process(chip);
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { addBot('Voice के लिए Chrome browser use करें।'); return; }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const r = new SR();
    r.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
    r.continuous = false; r.interimResults = false;
    r.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setListening(false);
      addUser(text);
      process(text);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const changeLang = (l) => {
    setLang(l);
    setConvState({});
    if (open && msgs.length === 0) {
      setTimeout(() => addBot(AI_RESPONSES[l].greet), 300);
    }
  };

  const handleOpen = () => {
    setOpen(o => {
      if (!o && msgs.length === 0) {
        setTimeout(() => addBot(AI_RESPONSES[lang].greet), 450);
      }
      return !o;
    });
  };

  return (
    <>
      {/* FAB */}
      <button className="ai-fab" onClick={handleOpen} aria-label="AI Chatbot खोलें">
        <span>{open ? '✕' : '🤖'}</span>
        {!open && <span className="ai-fab-label">AI</span>}
      </button>

      {/* Chat Window */}
      <div className={`ai-window ${open ? 'ai-open' : ''}`}>
        {/* Header */}
        <div className="ai-header">
          <div className="ai-avatar">🤖</div>
          <div style={{ flex: 1 }}>
            <div className="ai-hname">गाड़ी Express AI</div>
            <div className="ai-hstatus"><span className="ai-dot" /> Online — हमेशा तैयार</div>
          </div>
          <button className="ai-close-btn" onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* Language Toggle */}
        <div className="ai-lang-row">
          {['hi', 'en', 'hinglish'].map(l => (
            <button key={l} className={`ai-lang-btn ${lang === l ? 'ai-lang-active' : ''}`} onClick={() => changeLang(l)}>
              {l === 'hi' ? '🇮🇳 हिंदी' : l === 'en' ? '🇬🇧 English' : '🔀 Hinglish'}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="ai-messages">
          {msgs.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role === 'user' ? 'ai-user' : 'ai-bot'}`}>
              {m.role === 'bot' && <div className="ai-msg-avatar">🤖</div>}
              <div>
                <div className="ai-bubble">{m.text}</div>
                <div className={`ai-time`} style={{ textAlign: m.role === 'user' ? 'right' : 'left' }}>{m.time}</div>
              </div>
              {m.role === 'user' && <div className="ai-msg-avatar" style={{ background: 'var(--saffron)', color: 'white' }}>👤</div>}
            </div>
          ))}
          {typing && (
            <div className="ai-msg ai-bot">
              <div className="ai-msg-avatar">🤖</div>
              <div className="ai-bubble" style={{ padding: 0 }}>
                <div className="ai-typing">
                  <div className="ai-typing-dot" />
                  <div className="ai-typing-dot" />
                  <div className="ai-typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={msgsEndRef} />
        </div>

        {/* Quick Chips */}
        <div className="ai-chips">
          {AI_CHIPS[lang].map(chip => (
            <button key={chip} className="ai-chip" onClick={() => handleChip(chip)}>{chip}</button>
          ))}
        </div>

        {/* Input Row */}
        <div className="ai-input-row">
          <input
            className="ai-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={lang === 'en' ? 'Type here...' : lang === 'hinglish' ? 'Yahan type karo...' : 'यहाँ टाइप करें...'}
          />
          <button className={`ai-mic-btn ${listening ? 'ai-listening' : ''}`} onClick={toggleVoice} title="Voice Input">
            {listening ? '⏹' : '🎤'}
          </button>
          <button className="ai-send-btn" onClick={send} title="Send">➤</button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('home');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        {screen === 'home' && (
          <>
            <Header title="गाड़ी एक्सप्रेस" subtitle="Rural Transport Network" />
            <HomeScreen onSelectRole={setScreen} />
          </>
        )}
        {screen === 'customer' && <CustomerScreen showToast={showToast} onBack={() => setScreen('home')} />}
        {screen === 'driver'   && <DriverScreen   showToast={showToast} onBack={() => setScreen('home')} />}
        {screen === 'admin'    && <AdminScreen    showToast={showToast} onBack={() => setScreen('home')} />}
        {toast && <Toast msg={toast.msg} type={toast.type} />}
        <AIChatbot />
      </div>
    </>
  );
}
