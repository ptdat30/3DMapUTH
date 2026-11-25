'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, ExternalLink, QrCode, MapPin, Copy, Check } from 'lucide-react';
import { CS1_QR_STATIONS } from '@/data/cs1OutdoorRouting';

export default function QrAdminPage() {
  const [baseUrl, setBaseUrl] = useState<string>('http://localhost:3000');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleCopy = (code: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Bar (hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-sm font-semibold text-slate-700 shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Về Bản đồ 3D Campus</span>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" strokeWidth={1.5} />
            <span>In 2 Bảng QR Dán Trường</span>
          </button>
        </div>

        {/* Header & Domain Config */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 print:hidden">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">
                Quản lý & Xuất 2 Mã QR Định Vị Cơ Sở 1 (3DMapUTH)
              </h1>
              <p className="text-xs text-slate-500">
                Quét QR → Định vị 3D → Tìm phòng → Chỉ đường tới cửa tòa nhà → Xác nhận mở Bản đồ 2D từng bước
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Tên miền triển khai (đổi sang link Vercel / domain thật trước khi in dán):
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value.replace(/\/$/, ''))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://3dmaputh.vercel.app"
            />
          </div>
        </div>

        {/* 2 Printable QR Station Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CS1_QR_STATIONS.map((qr, idx) => {
            const targetUrl = `${baseUrl}/?campus=cs1&qr=${qr.code}`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(
              targetUrl
            )}`;
            const isCopied = copiedCode === qr.code;

            return (
              <div
                key={qr.id}
                className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 flex flex-col items-center text-center break-inside-avoid"
              >
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-extrabold tracking-wide uppercase mb-3">
                  ĐIỂM ĐẶT QR SỐ {idx + 1} • CƠ SỞ 1 UTH
                </span>

                <h2 className="text-base font-extrabold text-slate-900 mb-1">{qr.name}</h2>
                <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                  <span>Quét bằng Camera điện thoại để mở bản đồ dẫn đường</span>
                </p>

                {/* Crisp QR Frame */}
                <div className="p-3 bg-white rounded-2xl border-2 border-blue-100 shadow-inner mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrImageUrl}
                    alt={`Mã QR ${qr.name}`}
                    className="w-56 h-56 object-contain"
                  />
                </div>

                <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 rounded-xl px-3 py-2 w-full mb-4 break-all font-mono border border-slate-200/70">
                  {targetUrl}
                </div>

                <div className="w-full grid grid-cols-2 gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={() => handleCopy(qr.code, targetUrl)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Chép URL</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/?campus=cs1&qr=${qr.code}`}
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Test luồng ngay</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
