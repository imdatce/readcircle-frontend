/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";

export function NameUpdateModal({
  isOpen,
  onClose,
  onSubmit,
  newNameInput,
  setNewNameInput,
  nameUpdateSuccess,
  t,
}: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 border border-gray-100 dark:border-gray-800">
        {nameUpdateSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {t("success") || "Başarılı!"}
            </h3>
            <p className="text-sm text-gray-500">
              {t("nameUpdatedSuccess") ||
                "İsim güncellendi, lütfen tekrar giriş yapın."}
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-black mb-6 text-gray-900 dark:text-white">
              {t("changeName") || "Adı Değiştir"}
            </h3>
            <input
              type="text"
              value={newNameInput}
              onChange={(e) => setNewNameInput(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl mb-6 text-lg font-bold outline-none transition-all text-gray-900 dark:text-white"
              placeholder={t("enterNewName") || "Yeni Adınız"}
            />
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {t("cancel") || "İptal"}
              </button>
              <button
                onClick={onSubmit}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
              >
                {t("saveChanges") || "Kaydet"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function PasswordUpdateModal({
  isOpen,
  onClose,
  onSubmit,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  passwordUpdateSuccess,
  t,
}: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 border border-gray-100 dark:border-gray-800">
        {passwordUpdateSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {t("success") || "Başarılı!"}
            </h3>
            <p className="text-sm text-gray-500">
              {t("passwordUpdatedSuccess") || "Şifreniz güncellendi!"}
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-black mb-6 text-gray-900 dark:text-white">
              {t("changePassword") || "Şifre Değiştir"}
            </h3>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl mb-3 text-lg font-bold outline-none transition-all text-gray-900 dark:text-white"
              placeholder={t("currentPassword") || "Mevcut Şifre"}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl mb-6 text-lg font-bold outline-none transition-all text-gray-900 dark:text-white"
              placeholder={t("newPassword") || "Yeni Şifre"}
            />
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {t("cancel") || "İptal"}
              </button>
              <button
                onClick={onSubmit}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all"
              >
                {t("saveChanges") || "Kaydet"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
