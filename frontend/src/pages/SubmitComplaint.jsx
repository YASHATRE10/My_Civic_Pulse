import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { COMPLAINT_CATEGORIES } from '../utils/constants';
import Toast from '../components/Toast';

export default function SubmitComplaint() {
  const { t } = useTranslation();
  const [preview, setPreview] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [locationStatus, setLocationStatus] = useState('idle');
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm();

  const toReadableAddress = (data) => {
    const parts = [
      data.locality,
      data.city,
      data.principalSubdivision,
      data.countryName
    ].filter(Boolean);

    return parts.join(', ');
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      setToast({ message: t('submitComplaint.locationUnsupported'), type: 'error' });
      return;
    }

    setLocationStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          if (!response.ok) {
            throw new Error('Unable to reverse geocode location');
          }

          const geoData = await response.json();
          const readableAddress = toReadableAddress(geoData);

          if (!readableAddress) {
            throw new Error('Address not available for this location');
          }

          setValue('location', readableAddress, { shouldValidate: true, shouldDirty: true });
          setLocationStatus('success');
        } catch {
          setLocationStatus('error');
          setToast({ message: t('submitComplaint.locationReverseFailed'), type: 'error' });
        }
      },
      () => {
        setLocationStatus('error');
        setToast({ message: t('submitComplaint.locationPermissionFailed'), type: 'error' });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (k === 'image') {
          if (v?.[0]) formData.append('image', v[0]);
        } else {
          formData.append(k, v);
        }
      });
      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      reset();
      setLocationStatus('idle');
      setPreview('');
      setToast({ message: t('submitComplaint.submitted'), type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || t('submitComplaint.submitFailed'), type: 'error' });
    }
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-card max-w-3xl">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      <h2 className="text-2xl font-heading font-semibold">{t('submitComplaint.title')}</h2>
      <p className="text-sm text-slate-500">{t('submitComplaint.description')}</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder={t('submitComplaint.complaintTitle')} {...register('title', { required: t('submitComplaint.validation.titleRequired') })} />
          {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
        </div>
        <textarea className="w-full rounded-xl border border-slate-200 px-4 py-3 min-h-28" placeholder={t('submitComplaint.complaintDescription')} {...register('description', { required: t('submitComplaint.validation.descriptionRequired') })} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className="rounded-xl border border-slate-200 px-4 py-3" {...register('category', { required: true })}>
            {COMPLAINT_CATEGORIES.map((cat) => <option key={cat} value={cat}>{t(`categories.${cat}`, { defaultValue: cat.replace('_', ' ') })}</option>)}
          </select>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            placeholder={locationStatus === 'loading' ? t('submitComplaint.detectingAddress') : t('submitComplaint.addressPlaceholder')}
            {...register('location', { required: t('submitComplaint.validation.locationRequired') })}
          />
          <button
            type="button"
            onClick={detectLocation}
            className="text-xs text-primary font-medium text-left"
            disabled={locationStatus === 'loading'}
          >
            {locationStatus === 'loading' ? t('submitComplaint.detectingAddress') : t('submitComplaint.useCurrentLocation')}
          </button>
        </div>
        {errors.location && <p className="text-xs text-rose-600 -mt-2">{errors.location.message}</p>}
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          {...register('image', { required: t('submitComplaint.validation.imageRequired') })}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setPreview(URL.createObjectURL(file));
            }
          }}
        />
        {errors.image && <p className="text-xs text-rose-600 -mt-2">{errors.image.message}</p>}
        {preview && <img src={preview} alt="preview" className="h-36 rounded-xl object-cover" />}
        <button disabled={isSubmitting} className="rounded-xl bg-primary text-white px-6 py-3">
          {isSubmitting ? t('submitComplaint.submitting') : t('submitComplaint.submit')}
        </button>
      </form>
    </div>
  );
}
