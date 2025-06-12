
-- Agregar los nuevos campos de promedios salariales a la tabla empleados
ALTER TABLE public.empleados 
ADD COLUMN promedio_salarial_mensual numeric DEFAULT 0,
ADD COLUMN promedio_no_salarial_mensual numeric DEFAULT 0;

-- Agregar comentarios para documentar los nuevos campos
COMMENT ON COLUMN public.empleados.promedio_salarial_mensual IS 'Promedio de componentes salariales mensuales del empleado';
COMMENT ON COLUMN public.empleados.promedio_no_salarial_mensual IS 'Promedio de componentes no salariales mensuales del empleado';
