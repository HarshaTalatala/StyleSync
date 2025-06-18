import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async ({ email, password }) => {
    try {
      setLoading(true);
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-73px)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="bg-white/90 p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md relative">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-60 z-0 hidden sm:block"></div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-light text-slate-800 text-center mb-2 tracking-tight">
            Log in to <span className="text-indigo-600 font-medium">StyleSync</span>
          </h2>
          <p className="text-slate-500 text-center mb-6 text-sm md:text-base">
            Welcome back! Please enter your details.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email', { required: 'Email is required' })}
                className="border border-slate-200 rounded-md w-full py-2.5 md:py-2 px-3 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register('password', { required: 'Password is required' })}
                className="border border-slate-200 rounded-md w-full py-2.5 md:py-2 px-3 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 md:py-3 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium text-base hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;