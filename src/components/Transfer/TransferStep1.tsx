import { Formik, Form, Field } from 'formik'; 
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faGlobe } from '@fortawesome/free-solid-svg-icons';

interface TransferStep1Props {
  onNext: (transferType: 'internal' | 'external') => void;
}

const validationSchema = Yup.object({
  transferType: Yup.string().required('Veuillez choisir un type de virement'),
});

export const TransferStep1 = ({ onNext }: TransferStep1Props) => {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-secondary mb-8 text-center">
        Effectuer un virement
      </h2>
      
      <Formik
        initialValues={{
          transferType: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          onNext(values.transferType as 'internal' | 'external');
        }}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form className="space-y-6">
            {/* Type de virement */}
            <div>
              <div className="space-y-4">
                {/* Virement interne */}
                <label
                  className={`flex items-start p-5 rounded-xl cursor-pointer transition-all ${
                    values.transferType === 'internal'
                      ? 'bg-primary text-white'
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={() => setFieldValue('transferType', 'internal')}
                >
                  <Field
                    type="radio"
                    name="transferType"
                    value="internal"
                    className="hidden"
                  />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      {/* Icône dans un rond */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        values.transferType === 'internal' ? 'bg-white/20' : 'bg-primary/10'
                      }`}>
                        <FontAwesomeIcon 
                          icon={faPaperPlane} 
                          className={`text-xl ${
                            values.transferType === 'internal' ? 'text-white' : 'text-primary'
                          }`}
                        />
                      </div>
                      {/* Texte */}
                      <div>
                        <p className={`font-semibold text-base mb-1 ${
                          values.transferType === 'internal' ? 'text-white' : 'text-secondary'
                        }`}>Virement interne</p>
                        <p className={`text-sm ${
                          values.transferType === 'internal' ? 'text-white/90' : 'text-neutral-500'
                        }`}>Envoyer des fonds sur vos comptes</p>
                      </div>
                    </div>
                    {/* Flèche */}
                    <svg 
                      className={`w-6 h-6 ${
                        values.transferType === 'internal' ? 'text-white' : 'text-neutral-400'
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </label>

                {/* Virement externe */}
                <label
                  className={`flex items-start p-5 rounded-xl cursor-pointer transition-all ${
                    values.transferType === 'external'
                      ? 'bg-primary text-white'
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={() => setFieldValue('transferType', 'external')}
                >
                  <Field
                    type="radio"
                    name="transferType"
                    value="external"
                    className="hidden"
                  />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      {/* Icône dans un rond */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        values.transferType === 'external' ? 'bg-white/20' : 'bg-primary/10'
                      }`}>
                        <FontAwesomeIcon
                          icon={faGlobe}
                          className={`text-xl ${
                            values.transferType === 'external' ? 'text-white' : 'text-primary'
                          }`}
                        />
                      </div>
                      {/* Texte */}
                      <div>
                        <p className={`font-semibold text-base mb-1 ${
                          values.transferType === 'external' ? 'text-white' : 'text-secondary'
                        }`}>Virement externe</p>
                        <p className={`text-sm ${
                          values.transferType === 'external' ? 'text-white/90' : 'text-neutral-500'
                        }`}>Effectuez un virement instantané</p>
                      </div>
                    </div>
                    {/* Flèche */}
                    <svg
                      className={`w-6 h-6 ${
                        values.transferType === 'external' ? 'text-white' : 'text-neutral-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </label>
              </div>

              {errors.transferType && touched.transferType && (
                <p className="mt-2 text-sm text-danger">{errors.transferType}</p>
              )}
            </div>

            {/* Boutons */}
            <div className="flex justify-between pt-4 px-2">
              <button
                type="button"
                className="w-32 bg-white border-2 border-black text-secondary font-bold py-3 rounded-lg hover:bg-neutral-50 transition-colors duration-200 text-center"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="w-32 bg-primary hover:bg-primary/90 text-secondary font-bold py-3 rounded-lg transition-colors duration-200 text-center"
              >
                Suivant
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};